import Foundation
import UIKit
import Supabase

private struct GroupMomentRPC: Encodable {
    let p_id: UUID
    let p_path: String
    let p_caption: String
    let p_media_kind: String
    let p_group: UUID
}

extension CloudService {
    /// Creates a single moment and gives every group member explicit access
    /// at the time of posting. New members do not automatically gain access
    /// to historic photos.
    func publishToGroup(image: UIImage?, videoURL: URL?,
                        caption: String, groupID: UUID) async -> Bool {
        guard let api = sharedClient, let me = userID else { return false }
        let kind: String
        let ext: String
        let bytes: Data
        do {
            if let videoURL {
                try await VideoMedia.validate(videoURL)
                bytes = try Data(contentsOf: videoURL)
                kind = "video"
                ext = "mov"
            } else if let image, let jpeg = ImageProcessor.jpeg(image) {
                bytes = jpeg
                kind = "photo"
                ext = "jpg"
            } else {
                errorMessage = "Chọn một ảnh hoặc video."
                return false
            }

            let momentID = UUID()
            let objectPath = "\(me.uuidString.lowercased())/\(momentID.uuidString.lowercased()).\(ext)"
            try await api.storage.from("moments").upload(
                path: objectPath,
                file: bytes,
                options: FileOptions(contentType: kind == "video"
                                     ? "video/quicktime" : "image/jpeg")
            )
            do {
                try await api.rpc("publish_moment_group", params: GroupMomentRPC(
                    p_id: momentID, p_path: objectPath,
                    p_caption: String(caption.prefix(2000)),
                    p_media_kind: kind, p_group: groupID
                )).execute()
            } catch {
                _ = try? await api.storage.from("moments")
                    .remove(paths: [objectPath])
                throw error
            }
            await refresh()
            infoMessage = "Đã chia sẻ với nhóm đã chọn."
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
