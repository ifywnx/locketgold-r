import Foundation
import AVFoundation

enum SoundtrackExporter {
    enum Failure: LocalizedError {
        case missingVideo, missingAudio, exportUnavailable
        var errorDescription: String? {
            switch self {
            case .missingVideo: "Video không hợp lệ."
            case .missingAudio: "Không đọc được âm thanh. Hãy chọn tệp âm thanh bạn có quyền sử dụng."
            case .exportUnavailable: "Thiết bị không thể xuất video ghép âm thanh."
            }
        }
    }

    /// For silent recap movies; replace the silent audio track with
    /// user-owned/rights-cleared audio from Files. No third-party song catalog.
    static func addAudio(videoURL: URL, musicURL: URL) async throws -> URL {
        let video = AVURLAsset(url: videoURL)
        let audio = AVURLAsset(url: musicURL)
        let duration = try await video.load(.duration)
        let videos = try await video.loadTracks(withMediaType: .video)
        let audios = try await audio.loadTracks(withMediaType: .audio)
        guard let videoTrack = videos.first else { throw Failure.missingVideo }
        guard let audioTrack = audios.first else { throw Failure.missingAudio }

        let composition = AVMutableComposition()
        guard let targetVideo = composition.addMutableTrack(
            withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid
        ), let targetAudio = composition.addMutableTrack(
            withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid
        ) else { throw Failure.exportUnavailable }

        try targetVideo.insertTimeRange(
            CMTimeRange(start: .zero, duration: duration),
            of: videoTrack, at: .zero
        )
        targetVideo.preferredTransform = try await videoTrack.load(.preferredTransform)
        let audioDuration = try await audio.load(.duration)
        let actual = CMTimeMinimum(duration, audioDuration)
        guard CMTimeCompare(actual, .zero) > 0 else { throw Failure.missingAudio }
        try targetAudio.insertTimeRange(
            CMTimeRange(start: .zero, duration: actual),
            of: audioTrack, at: .zero
        )
        guard let session = AVAssetExportSession(
            asset: composition,
            presetName: AVAssetExportPresetHighestQuality
        ) else { throw Failure.exportUnavailable }
        let output = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString + ".mov")
        session.outputURL = output
        session.outputFileType = .mov
        session.shouldOptimizeForNetworkUse = true

        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            session.exportAsynchronously {
                if session.status == .completed {
                    continuation.resume()
                } else {
                    continuation.resume(throwing: session.error ?? Failure.exportUnavailable)
                }
            }
        }
        return output
    }
}
