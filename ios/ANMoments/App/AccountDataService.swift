import Foundation
import Supabase

private struct DeleteAccountResponse: Decodable {
    let deleted: Bool
}

extension SocialService {
    /// Creates a JSON export of rows visible to the signed-in member.
    /// This metadata export intentionally excludes binary photos/videos.
    func exportCloudMetadata(_ cloud: CloudService) async -> URL? {
        guard let api = cloud.sharedClient, cloud.userID != nil else {
            errorMessage = "Đăng nhập để xuất dữ liệu đám mây."
            return nil
        }
        loading = true
        defer { loading = false }

        let collections = [
            "profiles", "friend_requests", "friendships",
            "moments", "moment_recipients", "moment_views",
            "reactions", "conversations", "conversation_members",
            "chat_messages", "activity_events", "user_blocks"
        ]
        var export: [String: Any] = [
            "format": "ANMoments cloud metadata export v1",
            "exportedAt": ISO8601DateFormatter().string(from: Date()),
            "accountID": cloud.userID!.uuidString,
            "notice": "Contains metadata only, not image/video bytes."
        ]

        do {
            for table in collections {
                var rows: [[String: Any]] = []
                var from = 0
                let pageSize = 300
                repeat {
                    let response = try await api.from(table).select("*")
                        .range(from: from, to: from + pageSize - 1)
                        .execute()
                    let value = try JSONSerialization.jsonObject(with: response.data)
                    guard let page = value as? [[String: Any]] else {
                        throw NSError(domain: "ANMomentsExport", code: 1,
                                      userInfo: [NSLocalizedDescriptionKey:
                                        "Dữ liệu \(table) không hợp lệ."])
                    }
                    rows.append(contentsOf: page)
                    from += page.count
                    if page.count < pageSize { break }
                    if from > 30_000 {
                        throw NSError(domain: "ANMomentsExport", code: 2,
                                      userInfo: [NSLocalizedDescriptionKey:
                                        "Dữ liệu quá lớn; cần xuất qua server."])
                    }
                } while true
                export[table] = rows
            }
            let json = try JSONSerialization.data(withJSONObject: export,
                                                   options: [.prettyPrinted, .sortedKeys])
            let file = FileManager.default.temporaryDirectory
                .appendingPathComponent("ANMoments-MyData-\(UUID().uuidString).json")
            try json.write(to: file, options: .atomic)
            return file
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    /// Calls a published Supabase Edge Function (if deployed by the owner).
    /// The function verifies user JWT, deletes their Storage media and Auth
    /// account. If it is not deployed, no success is reported.
    func permanentlyDeleteAccount(_ cloud: CloudService) async -> Bool {
        guard let api = cloud.sharedClient, cloud.userID != nil else {
            errorMessage = "Bạn chưa đăng nhập."
            return false
        }
        loading = true
        defer { loading = false }
        do {
            let response: DeleteAccountResponse = try await api.functions
                .invoke("delete-account")
            guard response.deleted else {
                errorMessage = "Máy chủ chưa xác nhận xóa tài khoản."
                return false
            }
            await cloud.clearDeletedAccount()
            clearSensitiveCache()
            notice = "Tài khoản đã được máy chủ xác nhận xóa."
            return true
        } catch {
            errorMessage = "Chưa xóa được tài khoản: \(error.localizedDescription)"
            return false
        }
    }
}

extension CloudService {
    func clearDeletedAccount() async {
        if let api = sharedClient {
            try? await api.auth.signOut()
        }
        userID = nil
        myProfile = nil
        moments = []
        friends = []
        requests = []
        reactions = [:]
        authorNames = [:]
        requesterNames = [:]
        authorBadges = [:]
        viewerNames = [:]
        WidgetBridge.saveLatest(data: nil)
    }
}
