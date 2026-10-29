import Foundation
import SwiftUI
import UIKit
import Supabase

@MainActor
final class CloudService: ObservableObject {
    let enabled = BackendConfig.isConfigured
    private let client: SupabaseClient?

    @Published var userID: UUID?
    @Published var myProfile: RemoteProfile?
    @Published var moments: [RemoteMoment] = []
    @Published var friends: [RemoteProfile] = []
    @Published var requests: [FriendRequest] = []
    @Published var busy = false
    @Published var errorMessage: String?
    @Published var infoMessage: String?

    init() {
        if BackendConfig.isConfigured, let url = URL(string: BackendConfig.urlString) {
            client = SupabaseClient(supabaseURL: url, supabaseKey: BackendConfig.publishableKey)
        } else {
            client = nil
        }
    }

    func restoreSession() async {
        guard let client else { return }
        if let session = try? await client.auth.session {
            userID = session.user.id
            await refresh()
        }
    }

    func sendOTP(email: String) async -> Bool {
        guard let client else { return false }
        busy = true
        defer { busy = false }
        do {
            try await client.auth.signInWithOTP(email: email)
            infoMessage = "Mã xác minh đã được gửi tới email. Hãy kiểm tra Inbox và Spam."
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func verifyOTP(email: String, token: String) async {
        guard let client else { return }
        busy = true
        defer { busy = false }
        do {
            try await client.auth.verifyOTP(email: email, token: token, type: .email)
            userID = try await client.auth.session.user.id
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() async {
        guard let client else { return }
        do {
            try await client.auth.signOut()
            userID = nil
            myProfile = nil
            moments = []
            friends = []
            requests = []
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refresh() async {
        guard let client, let userID else { return }
        busy = true
        defer { busy = false }

        do {
            myProfile = try await client.from("profiles")
                .select("id,handle,display_name")
                .eq("id", value: userID.uuidString)
                .single().execute().value

            let edges: [FriendEdge] = try await client.from("friendships")
                .select("friend_id")
                .eq("user_id", value: userID.uuidString)
                .execute().value

            var loadedFriends: [RemoteProfile] = []
            for edge in edges {
                if let found: RemoteProfile = try? await client.from("profiles")
                    .select("id,handle,display_name")
                    .eq("id", value: edge.friend_id.uuidString)
                    .single().execute().value {
                    loadedFriends.append(found)
                }
            }
            friends = loadedFriends.sorted { $0.display_name < $1.display_name }

            requests = try await client.from("friend_requests")
                .select("id,from_user,to_user,status")
                .eq("to_user", value: userID.uuidString)
                .eq("status", value: "pending")
                .execute().value

            var loadedMoments: [RemoteMoment] = try await client.from("moments")
                .select("id,author_id,storage_path,caption,created_at")
                .order("created_at", ascending: false)
                .limit(100).execute().value

            for index in loadedMoments.indices {
                loadedMoments[index].signedURL = try? await client.storage.from("moments")
                    .createSignedURL(path: loadedMoments[index].storage_path, expiresIn: 3600)
            }
            moments = loadedMoments
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func requestFriend(handle: String) async {
        guard let client else { return }
        let value = handle.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !value.isEmpty else { return }
        busy = true
        defer { busy = false }
        do {
            try await client.rpc("request_friend", params: ["recipient_handle": value]).execute()
            infoMessage = "Đã gửi lời mời kết bạn tới @\(value)."
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func acceptFriend(requestID: UUID) async {
        guard let client else { return }
        do {
            try await client.rpc("accept_friend", params: ["request_id": requestID.uuidString]).execute()
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func publish(image: UIImage, caption: String, recipients: [UUID]) async -> Bool {
        guard let client, let userID else { return false }
        guard let bytes = image.jpegData(compressionQuality: 0.78) else {
            errorMessage = "Không thể mã hóa ảnh."
            return false
        }
        busy = true
        defer { busy = false }

        let momentID = UUID()
        let path = "\(userID.uuidString)/\(momentID.uuidString).jpg"
        do {
            try await client.storage.from("moments").upload(path: path, file: bytes)
            do {
                // One database transaction saves the moment AND recipient list.
                // Avoids partially shared posts if permission checks fail.
                try await client.rpc("publish_moment", params: PublishParams(
                    p_id: momentID,
                    p_path: path,
                    p_caption: caption,
                    p_recipients: recipients
                )).execute()
            } catch {
                // Reclaim the upload if the database transaction failed.
                _ = try? await client.storage.from("moments").remove(paths: [path])
                throw error
            }
            await refresh()
            infoMessage = recipients.isEmpty ? "Đã lưu khoảnh khắc riêng." : "Đã chia sẻ khoảnh khắc."
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func delete(_ moment: RemoteMoment) async {
        guard let client, let userID, moment.author_id == userID else { return }
        do {
            try await client.from("moments").delete().eq("id", value: moment.id.uuidString).execute()
            _ = try? await client.storage.from("moments").remove(paths: [moment.storage_path])
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateProfile(displayName: String) async {
        guard let client, let userID else { return }
        let name = displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return }
        do {
            try await client.from("profiles")
                .update(["display_name": name])
                .eq("id", value: userID.uuidString)
                .execute()
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
