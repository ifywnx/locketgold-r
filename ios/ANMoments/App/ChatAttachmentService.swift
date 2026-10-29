import Foundation
import UIKit
import Supabase

private struct ChatMediaRPC: Encodable {
    let p_conversation: UUID
    let p_path: String
    let p_kind: String
    let p_caption: String
}

extension SocialService {
    /// Upload into a private, per-sender folder. A separate authorized RPC
    /// attaches the file to a chat whose membership includes the sender.
    func sendPhoto(_ photo: UIImage, to conversation: UUID,
                   cloud: CloudService) async -> Bool {
        guard let bytes = ImageProcessor.jpeg(photo) else {
            errorMessage = "Không thể xử lý ảnh."
            return false
        }
        return await sendAttachment(bytes, kind: "photo",
                                    ext: "jpg", room: conversation, cloud: cloud)
    }

    func sendVideo(_ url: URL, to conversation: UUID,
                   cloud: CloudService) async -> Bool {
        do {
            try await VideoMedia.validate(url)
            let bytes = try Data(contentsOf: url)
            return await sendAttachment(bytes, kind: "video",
                                        ext: "mov", room: conversation, cloud: cloud)
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    private func sendAttachment(_ bytes: Data, kind: String,
                                ext: String, room: UUID,
                                cloud: CloudService) async -> Bool {
        guard let api = cloud.sharedClient, let user = cloud.userID else {
            return false
        }
        loading = true
        defer { loading = false }
        let path = "\(user.uuidString.lowercased())/\(UUID().uuidString.lowercased()).\(ext)"
        do {
            try await api.storage.from("chat_media").upload(
                path: path,
                file: bytes,
                options: FileOptions(
                    contentType: kind == "photo" ? "image/jpeg" : "video/quicktime"
                )
            )
            do {
                try await api.rpc("send_chat_media",
                    params: ChatMediaRPC(p_conversation: room,
                                         p_path: path, p_kind: kind,
                                         p_caption: "")
                ).execute()
            } catch {
                _ = try? await api.storage.from("chat_media").remove(paths: [path])
                throw error
            }
            await loadMessages(room, cloud: cloud)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func loadAttachmentURLs(_ messages: [ChatMessage], cloud: CloudService) async {
        guard let api = cloud.sharedClient else { return }
        var next: [String: URL] = [:]
        for message in messages {
            guard let path = message.media_path else { continue }
            if let previous = mediaURLs[path] {
                next[path] = previous
                continue
            }
            if let url = try? await api.storage.from("chat_media")
                .createSignedURL(path: path, expiresIn: 900) {
                next[path] = url
            }
        }
        // Replace the whole dictionary on identity-scoped refresh.
        mediaURLs.merge(next) { _, new in new }
    }

    /// Realtime listens to INSERT events while the chat is on screen.
    /// It requires chat_messages enabled in the Realtime publication.
    /// The normal foreground polling remains the fallback.
    func observeChat(_ room: UUID, cloud: CloudService) async {
        guard let api = cloud.sharedClient, cloud.userID != nil else { return }
        let channel = api.channel("room-\(room.uuidString.lowercased())")
        let updates = channel.postgresChange(
            InsertAction.self,
            schema: "public",
            table: "chat_messages",
            filter: .eq("conversation_id", value: room.uuidString.lowercased())
        )
        await channel.subscribe()
        for await _ in updates {
            if Task.isCancelled { break }
            await loadMessages(room, cloud: cloud)
        }
        await channel.unsubscribe()
    }
}
