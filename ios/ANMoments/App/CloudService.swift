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
    @Published var reactions: [UUID: String] = [:]
    @Published var requesterNames: [UUID: String] = [:]
    @Published var authorNames: [UUID: String] = [:]
    @Published var authorBadges: [UUID: String] = [:]
    @Published var viewerNames: [UUID: [String]] = [:]
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
            reactions = [:]
            requesterNames = [:]
            authorNames = [:]
            authorBadges = [:]
            viewerNames = [:]
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
                .select("id,handle,display_name,badge_style")
                .eq("id", value: userID.uuidString)
                .single().execute().value

            let edges: [FriendEdge] = try await client.from("friendships")
                .select("friend_id")
                .eq("user_id", value: userID.uuidString)
                .execute().value

            var loadedFriends: [RemoteProfile] = []
            for edge in edges {
                if let found: RemoteProfile = try? await client.from("profiles")
                    .select("id,handle,display_name,badge_style")
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

            var names: [UUID: String] = [:]
            for request in requests {
                if let profile: RemoteProfile = try? await client.from("profiles")
                    .select("id,handle,display_name,badge_style")
                    .eq("id", value: request.from_user.uuidString)
                    .single().execute().value {
                    names[request.from_user] = profile.display_name + " (@" + profile.handle + ")"
                }
            }
            requesterNames = names

            let mine: [RemoteReaction] = try await client.from("reactions")
                .select("moment_id,sender_id,emoji")
                .eq("sender_id", value: userID.uuidString)
                .execute().value
            reactions = Dictionary(uniqueKeysWithValues: mine.map { ($0.moment_id, $0.emoji) })

            var loadedMoments: [RemoteMoment] = try await client.from("moments")
                .select("id,author_id,storage_path,media_kind,caption,created_at")
                .order("created_at", ascending: false)
                .limit(100).execute().value

            for index in loadedMoments.indices {
                loadedMoments[index].signedURL = try? await client.storage.from("moments")
                    .createSignedURL(path: loadedMoments[index].storage_path, expiresIn: 3600)
            }
            moments = loadedMoments
            var namesOfAuthors: [UUID: String] = [:]
            for authorID in Set(loadedMoments.map(\.author_id)) {
                if let profile: RemoteProfile = try? await client.from("profiles")
                    .select("id,handle,display_name,badge_style")
                    .eq("id", value: authorID.uuidString)
                    .single().execute().value {
                    namesOfAuthors[authorID] = profile.display_name
                }
            }
            authorNames = namesOfAuthors
            authorBadges = Dictionary(uniqueKeysWithValues: loadedMoments.compactMap { moment in
                if moment.author_id == userID { return (moment.author_id, myProfile?.badge_style ?? "heart") }
                return (moment.author_id, friends.first(where: { $0.id == moment.author_id })?.badge_style ?? "heart")
            }.reduce(into: [UUID: String]()) { $0[$1.0] = $1.1 }.map { ($0.key, $0.value) })
            if let latestURL = loadedMoments.first(where: { !$0.isVideo })?.signedURL,
               let (data, _) = try? await URLSession.shared.data(from: latestURL) {
                WidgetBridge.saveLatest(data: data)
            }
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
        guard let bytes = ImageProcessor.jpeg(image) else {
            errorMessage = "Không thể mã hóa ảnh."
            return false
        }
        return await publishData(bytes, mediaKind: "photo", fileExtension: "jpg", recipients: recipients, caption: caption)
    }

    func publishVideo(url: URL, caption: String, recipients: [UUID]) async -> Bool {
        do {
            try await VideoMedia.validate(url)
            let data = try Data(contentsOf: url)
            return await publishData(data, mediaKind: "video", fileExtension: "mov", recipients: recipients, caption: caption)
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    private func publishData(_ bytes: Data, mediaKind: String, fileExtension: String,
                             recipients: [UUID], caption: String) async -> Bool {
        guard let client, let userID else { return false }
        busy = true
        defer { busy = false }
        let momentID = UUID()
        let path = "\(userID.uuidString)/\(momentID.uuidString).\(fileExtension)"
        do {
            try await client.storage.from("moments").upload(
                path: path, file: bytes,
                options: FileOptions(contentType: mediaKind == "video" ? "video/quicktime" : "image/jpeg")
            )
            do {
                try await client.rpc("publish_moment", params: PublishMediaParams(
                    p_id: momentID,
                    p_path: path,
                    p_caption: caption,
                    p_recipients: recipients,
                    p_media_kind: mediaKind
                )).execute()
            } catch {
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

    func react(to momentID: UUID, emoji: String) async {
        guard let client, let userID else { return }
        do {
            try await client.from("reactions")
                .upsert(
                    ReactionPayload(moment_id: momentID, sender_id: userID, emoji: emoji),
                    onConflict: "moment_id,sender_id"
                ).execute()
            reactions[momentID] = emoji
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func recordView(_ moment: RemoteMoment) async {
        guard let client, let userID, moment.author_id != userID else { return }
        do {
            try await client.rpc("record_moment_view",
                params: ["p_moment": moment.id.uuidString]).execute()
        } catch {
            // Viewing must not prevent the rest of the feed from rendering.
        }
    }

    func loadViewers(_ moment: RemoteMoment) async {
        guard let client, let userID, moment.author_id == userID else { return }
        do {
            let records: [MomentViewer] = try await client.from("moment_views")
                .select("viewer_id")
                .eq("moment_id", value: moment.id.uuidString)
                .execute().value
            var names: [String] = []
            for item in records {
                if let profile: RemoteProfile = try? await client.from("profiles")
                    .select("id,handle,display_name,badge_style")
                    .eq("id", value: item.viewer_id.uuidString)
                    .single().execute().value {
                    names.append(profile.display_name + " (@" + profile.handle + ")")
                }
            }
            viewerNames[moment.id] = names
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removeFriend(_ id: UUID) async {
        guard let client else { return }
        do {
            try await client.rpc("remove_friend", params: ["other_user": id.uuidString]).execute()
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
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

    func updateBadge(_ style: String) async {
        guard let client, let userID else { return }
        do {
            try await client.from("profiles")
                .update(["badge_style": style])
                .eq("id", value: userID.uuidString)
                .execute()
            await refresh()
        } catch { errorMessage = error.localizedDescription }
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
