import Foundation
import SwiftUI
import Supabase

struct ChatRoom: Codable, Identifiable {
    let id: UUID
    let kind: String
    let title: String
    let created_by: UUID
    let created_at: String
    var isGroup: Bool { kind == "group" }
    var displayName: String { isGroup ? title : "Chat riêng" }
}

struct ChatMessage: Codable, Identifiable {
    let id: UUID
    let conversation_id: UUID
    let sender_id: UUID
    let body: String
    let media_path: String?
    let media_kind: String?
    let created_at: String
}

struct ActivityEvent: Codable, Identifiable {
    let id: UUID
    let recipient_id: UUID
    let actor_id: UUID?
    let event_kind: String
    let summary: String
    let created_at: String
    let read_at: String?
}

private struct StartGroupPayload: Encodable {
    let p_title: String
    let p_friends: [UUID]
}

private struct PostChatPayload: Encodable {
    let p_conversation: UUID
    let p_body: String
}

private struct BlockPayload: Encodable {
    let p_other: UUID
}

private struct ReportPayload: Encodable {
    let reporter_id: UUID
    let reported_id: UUID
    let category: String
    let details: String
}

private struct DeletionPayload: Encodable {
    let user_id: UUID
    let status: String
}

@MainActor
final class SocialService: ObservableObject {
    @Published var rooms: [ChatRoom] = []
    @Published var messages: [UUID: [ChatMessage]] = [:]
    @Published var mediaURLs: [String: URL] = [:]
    @Published var events: [ActivityEvent] = []
    @Published var blockedUsers: Set<UUID> = []
    @Published var errorMessage: String?
    @Published var notice: String?
    @Published var loading = false

    func clearSensitiveCache() {
        rooms = []
        messages = [:]
        mediaURLs = [:]
        events = []
        blockedUsers = []
        errorMessage = nil
        notice = nil
    }

    private func client(_ cloud: CloudService) -> SupabaseClient? {
        guard cloud.userID != nil else { return nil }
        return cloud.sharedClient
    }

    func loadRooms(_ cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        do {
            rooms = try await client.from("conversations")
                .select("id,kind,title,created_by,created_at")
                .order("created_at", ascending: false)
                .limit(100).execute().value
        } catch { errorMessage = error.localizedDescription }
    }

    func loadMessages(_ room: UUID, cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        do {
            let fetched: [ChatMessage] = try await client.from("chat_messages")
                .select("id,conversation_id,sender_id,body,media_path,media_kind,created_at")
                .eq("conversation_id", value: room.uuidString)
                .order("created_at", ascending: false)
                .limit(150).execute().value
            messages[room] = Array(fetched.reversed())
            await loadAttachmentURLs(messages[room] ?? [], cloud: cloud)
        } catch { errorMessage = error.localizedDescription }
    }

    @discardableResult
    func directChat(with friend: UUID, cloud: CloudService) async -> ChatRoom? {
        guard let client = client(cloud) else { return nil }
        loading = true
        defer { loading = false }
        do {
            let id: UUID = try await client.rpc("start_direct_chat",
                params: ["p_other": friend.uuidString]).execute().value
            await loadRooms(cloud)
            return rooms.first(where: { $0.id == id })
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    @discardableResult
    func groupChat(title: String, friends: [UUID], cloud: CloudService) async -> ChatRoom? {
        guard let client = client(cloud) else { return nil }
        loading = true
        defer { loading = false }
        do {
            let id: UUID = try await client.rpc("start_group_chat",
                params: StartGroupPayload(p_title: title, p_friends: friends)).execute().value
            await loadRooms(cloud)
            return rooms.first(where: { $0.id == id })
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func send(_ body: String, to room: UUID, cloud: CloudService) async -> Bool {
        guard let client = client(cloud) else { return false }
        let text = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, text.count <= 2000 else { return false }
        do {
            try await client.rpc("send_chat_message",
                params: PostChatPayload(p_conversation: room, p_body: text)).execute()
            await loadMessages(room, cloud: cloud)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func loadActivity(_ cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        do {
            events = try await client.from("activity_events")
                .select("id,recipient_id,actor_id,event_kind,summary,created_at,read_at")
                .order("created_at", ascending: false)
                .limit(100).execute().value
        } catch { errorMessage = error.localizedDescription }
    }

    func markRead(_ event: ActivityEvent, cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        do {
            let now = ISO8601DateFormatter().string(from: Date())
            try await client.from("activity_events")
                .update(["read_at": now])
                .eq("id", value: event.id.uuidString).execute()
            await loadActivity(cloud)
        } catch { errorMessage = error.localizedDescription }
    }

    func loadBlocks(_ cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        struct BlockRow: Decodable { let blocked_id: UUID }
        do {
            let rows: [BlockRow] = try await client.from("user_blocks")
                .select("blocked_id").execute().value
            blockedUsers = Set(rows.map(\.blocked_id))
        } catch { errorMessage = error.localizedDescription }
    }

    func block(handle: String, cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        let normalized = handle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !normalized.isEmpty else { return }
        do {
            try await client.rpc("block_handle",
                params: ["p_handle": normalized]).execute()
            await loadBlocks(cloud)
            await cloud.refresh()
            notice = "Đã chặn @" + normalized.replacingOccurrences(of: "@", with: "")
        } catch { errorMessage = error.localizedDescription }
    }

    func unblock(_ id: UUID, cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        do {
            try await client.from("user_blocks").delete()
                .eq("blocked_id", value: id.uuidString).execute()
            await loadBlocks(cloud)
            notice = "Đã bỏ chặn."
        } catch { errorMessage = error.localizedDescription }
    }

    func report(handle: String, category: String, details: String, cloud: CloudService) async {
        guard let client = client(cloud) else { return }
        do {
            try await client.rpc("report_handle", params: [
                "p_handle": handle.trimmingCharacters(in: .whitespacesAndNewlines),
                "p_category": category,
                "p_details": String(details.prefix(1000))
            ]).execute()
            notice = "Đã lưu báo cáo vào hàng chờ kiểm duyệt."
        } catch { errorMessage = error.localizedDescription }
    }

    func requestAccountDeletion(_ cloud: CloudService) async {
        guard let client = client(cloud), let me = cloud.userID else { return }
        do {
            try await client.from("account_deletion_requests").insert(
                DeletionPayload(user_id: me, status: "pending")
            ).execute()
            notice = "Đã tạo yêu cầu. Tài khoản chưa được xóa; quản trị viên cần xử lý."
        } catch { errorMessage = error.localizedDescription }
    }
}
