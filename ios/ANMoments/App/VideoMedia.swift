import SwiftUI
import UIKit
import PhotosUI
import UniformTypeIdentifiers
import AVFoundation
import AVKit
import CoreTransferable

// PhotosPicker transfers temporary files. Copy them into a file owned by the
// app before the item provider's temporary URL expires.
struct ImportedMovie: Transferable {
    let url: URL
    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { movie in
            SentTransferredFile(movie.url)
        } importing: { received in
            let file = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension("mov")
            try FileManager.default.copyItem(at: received.file, to: file)
            return ImportedMovie(url: file)
        }
    }
}

struct VideoCameraPicker: UIViewControllerRepresentable {
    let onMovie: (URL) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.mediaTypes = [UTType.movie.identifier]
        picker.cameraCaptureMode = .video
        picker.videoMaximumDuration = 60
        picker.videoQuality = .typeMedium
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ picker: UIImagePickerController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: VideoCameraPicker
        init(parent: VideoCameraPicker) { self.parent = parent }
        func imagePickerController(_ picker: UIImagePickerController,
                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let origin = info[.mediaURL] as? URL {
                let temporary = FileManager.default.temporaryDirectory
                    .appendingPathComponent(UUID().uuidString + ".mov")
                if (try? FileManager.default.copyItem(at: origin, to: temporary)) != nil {
                    parent.onMovie(temporary)
                }
            }
            parent.dismiss()
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

enum VideoMedia {
    static let maxDuration: Double = 60
    static let maxSizeBytes: Int64 = 100 * 1024 * 1024

    static func validate(_ url: URL) async throws {
        let attrs = try FileManager.default.attributesOfItem(atPath: url.path)
        let size = (attrs[.size] as? NSNumber)?.int64Value ?? 0
        guard size > 0, size <= maxSizeBytes else {
            throw VideoError.fileSize
        }
        let duration = try await AVURLAsset(url: url).load(.duration).seconds
        guard duration.isFinite, duration > 0, duration <= maxDuration + 0.5 else {
            throw VideoError.duration
        }
    }

    static func thumbnail(_ url: URL) -> UIImage? {
        let generator = AVAssetImageGenerator(asset: AVURLAsset(url: url))
        generator.appliesPreferredTrackTransform = true
        guard let cgImage = try? generator.copyCGImage(
            at: CMTime(seconds: 0.3, preferredTimescale: 600), actualTime: nil
        ) else { return nil }
        return UIImage(cgImage: cgImage)
    }

    enum VideoError: LocalizedError {
        case fileSize, duration
        var errorDescription: String? {
            switch self {
            case .fileSize: return "Video phải nhỏ hơn 100 MB."
            case .duration: return "Video phải dài từ 1 đến 60 giây."
            }
        }
    }
}
