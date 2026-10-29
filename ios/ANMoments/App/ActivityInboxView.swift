import SwiftUI

struct ActivityInboxView: View {
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var social: SocialService

    var body: some View {
        List {
            if !cloud.enabled {
                ContentUnavailableView(
                    "Chưa kết nối",
                    systemImage: "bell.slash",
                    description: Text("Thông báo trong app cần bật Supabase.")
                )
            } else if social.events.isEmpty {
                ContentUnavailableView("Chưa có thông báo", systemImage: "bell")
            } else {
                ForEach(social.events) { event in
                    Button {
                        Task { await social.markRead(event, cloud: cloud) }
                    } label: {
                        HStack(alignment: .top, spacing: 14) {
                            Image(systemName: eventSymbol(event.event_kind))
                                .foregroundStyle(Theme.gold)
                                .font(.title2)
                            VStack(alignment: .leading, spacing: 5) {
                                Text(event.summary)
                                    .fontWeight(event.read_at == nil ? .semibold : .regular)
                                Text(event.created_at.replacingOccurrences(of: "T", with: " "))
                                    .font(.caption)
                                    .foregroundStyle(Theme.muted)
                            }
                            Spacer()
                            if event.read_at == nil {
                                Circle().fill(Theme.gold).frame(width: 9, height: 9)
                            }
                        }
                        .foregroundStyle(Theme.ink)
                    }
                }
            }
        }
        .navigationTitle("Thông báo")
        .scrollContentBackground(.hidden)
        .background(Theme.cream)
        .task { await social.loadActivity(cloud) }
        .refreshable { await social.loadActivity(cloud) }
    }

    private func eventSymbol(_ kind: String) -> String {
        switch kind {
        case "message": "bubble.left.fill"
        case "moment": "heart.square.fill"
        case "friend_request": "person.crop.circle.badge.plus"
        default: "bell.fill"
        }
    }
}
