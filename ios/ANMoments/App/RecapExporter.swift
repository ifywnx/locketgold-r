import Foundation
import UIKit
import AVFoundation
import CoreVideo
import CoreGraphics

enum RecapExporter {
    enum RecapError: LocalizedError {
        case empty, buffer, encoding
        var errorDescription: String? {
            switch self {
            case .empty: "Chưa có ảnh để tạo video tổng hợp."
            case .buffer: "Không tạo được khung hình video."
            case .encoding: "Không thể xuất tệp video."
            }
        }
    }

    static func export(images: [UIImage]) async throws -> URL {
        guard !images.isEmpty else { throw RecapError.empty }
        // Limit memory and export time to the latest 15 photos.
        let selected = Array(images.prefix(15))
        return try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                do {
                    let output = FileManager.default.temporaryDirectory
                        .appendingPathComponent(UUID().uuidString).appendingPathExtension("mov")
                    let width = 720, height = 1280
                    let writer = try AVAssetWriter(outputURL: output, fileType: .mov)
                    let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
                        AVVideoCodecKey: AVVideoCodecType.h264,
                        AVVideoWidthKey: width,
                        AVVideoHeightKey: height,
                        AVVideoCompressionPropertiesKey: [
                            AVVideoAverageBitRateKey: 2_200_000
                        ]
                    ])
                    input.expectsMediaDataInRealTime = false
                    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
                        assetWriterInput: input,
                        sourcePixelBufferAttributes: [
                            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
                            kCVPixelBufferWidthKey as String: width,
                            kCVPixelBufferHeightKey as String: height,
                            kCVPixelBufferCGImageCompatibilityKey as String: true,
                            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
                        ]
                    )
                    guard writer.canAdd(input) else { throw RecapError.encoding }
                    writer.add(input)
                    guard writer.startWriting() else {
                        throw writer.error ?? RecapError.encoding
                    }
                    writer.startSession(atSourceTime: .zero)
                    for (index, image) in selected.enumerated() {
                        while !input.isReadyForMoreMediaData {
                            Thread.sleep(forTimeInterval: 0.02)
                        }
                        let buffer = try makeBuffer(image, width: width, height: height)
                        guard adaptor.append(
                            buffer,
                            withPresentationTime: CMTime(seconds: Double(index)*2,
                                                         preferredTimescale: 600)
                        ) else {
                            throw writer.error ?? RecapError.encoding
                        }
                    }
                    // Final frame holds the last image for 2 additional seconds.
                    let last = try makeBuffer(selected.last!, width: width, height: height)
                    guard adaptor.append(last,
                        withPresentationTime: CMTime(seconds: Double(selected.count)*2,
                                                     preferredTimescale: 600))
                    else { throw writer.error ?? RecapError.encoding }
                    input.markAsFinished()
                    writer.finishWriting {
                        if writer.status == .completed {
                            continuation.resume(returning: output)
                        } else {
                            continuation.resume(throwing: writer.error ?? RecapError.encoding)
                        }
                    }
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    private static func makeBuffer(_ image: UIImage, width: Int,
                                   height: Int) throws -> CVPixelBuffer {
        var buffer: CVPixelBuffer?
        let attrs = [
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
        ] as CFDictionary
        guard CVPixelBufferCreate(
            kCFAllocatorDefault, width, height,
            kCVPixelFormatType_32ARGB, attrs, &buffer
        ) == kCVReturnSuccess, let buffer else { throw RecapError.buffer }
        CVPixelBufferLockBaseAddress(buffer, [])
        defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

        guard let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: width, height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        ) else { throw RecapError.buffer }
        context.setFillColor(UIColor.black.cgColor)
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        guard let source = image.cgImage else { throw RecapError.buffer }
        let scaling = max(CGFloat(width)/CGFloat(source.width),
                          CGFloat(height)/CGFloat(source.height))
        let w = CGFloat(source.width)*scaling, h = CGFloat(source.height)*scaling
        context.draw(source, in: CGRect(x: (CGFloat(width)-w)/2,
                                        y: (CGFloat(height)-h)/2,
                                        width: w, height: h))
        return buffer
    }
}
