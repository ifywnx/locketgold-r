import Foundation

struct LocalMoment: Codable, Identifiable, Equatable {
    var id: UUID = UUID()
    var createdAt: Date = Date()
    var caption: String
    var fileName: String
    var mediaKind: String? = nil
    var recipients: [String]
    var reaction: String? = nil
    var isVideo: Bool { mediaKind == "video" }
}

struct LocalFriend: Codable, Identifiable, Equatable {
    var id: UUID = UUID()
    var name: String
}

struct RemoteMoment: Decodable, Identifiable {
    let id: UUID
    let author_id: UUID
    let storage_path: String
    let media_kind: String
    let caption: String?
    let created_at: String
    var signedURL: URL? = nil

    private enum CodingKeys: String, CodingKey {
        case id, author_id, storage_path, media_kind, caption, created_at
    }

    var isVideo: Bool { media_kind == "video" }

    var date: Date {
        let withFraction = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return withFraction.date(from: created_at)
          ?? ISO8601DateFormatter().date(from: created_at)
          ?? Date()
    }
}

struct RemoteProfile: Codable, Identifiable {
    let id: UUID
    var handle: String
    var display_name: String
    var badge_style: String? = nil
}

struct FriendEdge: Decodable {
    let friend_id: UUID
}

struct FriendRequest: Decodable, Identifiable {
    let id: UUID
    let from_user: UUID
    let to_user: UUID
    let status: String
}

struct PostPayload: Encodable {
    let id: UUID
    let author_id: UUID
    let storage_path: String
    let caption: String
}

struct RecipientPayload: Encodable {
    let moment_id: UUID
    let recipient_id: UUID
}

enum MomentFormat {
    static func date(_ value: Date) -> String {
        value.formatted(.dateTime.day().month(.abbreviated).hour().minute())
    }
}

struct PublishParams: Encodable {
    let p_id: UUID
    let p_path: String
    let p_caption: String
    let p_recipients: [UUID]
}

struct RemoteReaction: Decodable {
    let moment_id: UUID
    let sender_id: UUID
    let emoji: String
}

struct ReactionPayload: Encodable {
    let moment_id: UUID
    let sender_id: UUID
    let emoji: String
}


struct PublishMediaParams: Encodable {
    let p_id: UUID
    let p_path: String
    let p_caption: String
    let p_recipients: [UUID]
    let p_media_kind: String
}

struct MomentViewer: Decodable {
    let viewer_id: UUID
}
