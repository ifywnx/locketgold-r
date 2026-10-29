import SwiftUI
import AVKit

struct FeedView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var appearance: AppearanceSettings
    @State private var showingViewers = false
    @State private var viewerList: [String] = []

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("AN Moments").font(.system(size: 31, weight: .bold, design: .rounded))
                            Text("Những điều nhỏ bé, đáng nhớ.")
                                .foregroundStyle(Theme.muted)
                        }
                        Spacer()
                        Image(systemName: "heart.square.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(appearance.cameraTheme.accent)
                    }

                    if !cloud.enabled {
                        status("CHẾ ĐỘ THỬ TRÊN MÁY", message: "Ảnh và video được lưu trên iPhone, chưa gửi đến máy bạn bè.")
                    }

                    if cloud.enabled {
                        if cloud.moments.isEmpty {
                            emptyState
                        }
                        ForEach(cloud.moments) { moment in
                            VStack(alignment: .leading, spacing: 12) {
                                header(
                                    moment.author_id == cloud.userID
                                        ? "Khoảnh khắc của bạn"
                                        : (cloud.authorNames[moment.author_id] ?? "Bạn bè"),
                                    date: moment.date,
                                    badge: cloud.authorBadges[moment.author_id]
                                )
                                if moment.isVideo {
                                    if let url = moment.signedURL {
                                        MomentVideoPlayer(url: url)
                                            .frame(height: 340)
                                            .clipShape(RoundedRectangle(cornerRadius: 24))
                                    } else {
                                        missingImage
                                    }
                                } else {
                                    AsyncImage(url: moment.signedURL) { phase in
                                        switch phase {
                                        case .success(let image):
                                            image.resizable().scaledToFill()
                                                .frame(maxWidth: .infinity)
                                                .frame(height: 360).clipped()
                                        case .failure:
                                            missingImage
                                        default:
                                            ProgressView().frame(maxWidth: .infinity).frame(height: 260)
                                        }
                                    }
                                    .clipShape(RoundedRectangle(cornerRadius: 24))
                                }
                                if let caption = moment.caption, !caption.isEmpty {
                                    Text(caption).font(.body)
                                }
                                HStack(spacing: 15) {
                                    ForEach(["❤️", "😂", "🥰", "🔥"], id: \.self) { emoji in
                                        Button(emoji) {
                                            Task { await cloud.react(to: moment.id, emoji: emoji) }
                                        }
                                        .font(.title2)
                                        .accessibilityLabel("Thả \(emoji)")
                                    }
                                    Spacer()
                                    if let myReaction = cloud.reactions[moment.id] {
                                        Text(myReaction).font(.title2)
                                    }
                                }
                                if moment.author_id == cloud.userID {
                                    Button {
                                        Task {
                                            await cloud.loadViewers(moment)
                                            viewerList = cloud.viewerNames[moment.id] ?? []
                                            showingViewers = true
                                        }
                                    } label: {
                                        Label("Ai đã xem", systemImage: "eye.fill")
                                            .font(.subheadline.bold())
                                    }
                                    Button("Xóa khoảnh khắc", role: .destructive) {
                                        Task { await cloud.delete(moment) }
                                    }
                                    .font(.caption)
                                }
                            }
                            .padding(16)
                            .background(.white, in: RoundedRectangle(cornerRadius: 28))
                            .onAppear {
                                Task { await cloud.recordView(moment) }
                            }
                        }
                    } else {
                        if album.moments.isEmpty { emptyState }
                        ForEach(album.moments) { moment in
                            VStack(alignment: .leading, spacing: 12) {
                                header("Khoảnh khắc của bạn", date: moment.createdAt, badge: appearance.badgeStyle.rawValue)
                                if moment.isVideo, let url = album.videoURL(for: moment) {
                                    MomentVideoPlayer(url: url)
                                        .frame(height: 340)
                                        .clipShape(RoundedRectangle(cornerRadius: 24))
                                } else if let image = album.image(for: moment) {
                                    Image(uiImage: image).resizable().scaledToFill()
                                        .frame(maxWidth: .infinity).frame(height: 360)
                                        .clipped()
                                        .clipShape(RoundedRectangle(cornerRadius: 24))
                                }
                                if !moment.caption.isEmpty { Text(moment.caption) }
                                if !moment.recipients.isEmpty {
                                    Text("Gắn nhãn: " + moment.recipients.joined(separator: ", "))
                                        .font(.caption).foregroundStyle(Theme.muted)
                                }
                                HStack(spacing: 14) {
                                    ForEach(["❤️", "😂", "🥰", "🔥"], id: \.self) { emoji in
                                        Button(emoji) { album.react(to: moment.id, emoji: emoji) }
                                            .font(.title2)
                                            .accessibilityLabel("Thả \(emoji)")
                                    }
                                    Spacer()
                                    if let reaction = moment.reaction {
                                        Text(reaction).font(.title2)
                                    }
                                    ShareLink(item: album.exportURL(for: moment)) {
                                        Image(systemName: "square.and.arrow.up")
                                    }
                                    .accessibilityLabel("Chia sẻ bằng hệ thống iOS")
                                    Button(role: .destructive) {
                                        album.delete(moment)
                                    } label: {
                                        Image(systemName: "trash")
                                    }
                                    .accessibilityLabel("Xóa khoảnh khắc")
                                }
                            }
                            .padding(16)
                            .background(.white, in: RoundedRectangle(cornerRadius: 28))
                        }
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .refreshable { await cloud.refresh() }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if cloud.enabled {
                        Button { Task { await cloud.refresh() } } label: {
                            Image(systemName: "arrow.clockwise")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingViewers) {
                NavigationStack {
                    List {
                        if viewerList.isEmpty {
                            ContentUnavailableView("Chưa có lượt xem", systemImage: "eye.slash")
                        } else {
                            ForEach(viewerList, id: \.self) { name in
                                Label(name, systemImage: "eye.fill")
                            }
                        }
                    }
                    .navigationTitle("Đã xem")
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Đóng") { showingViewers = false }
                        }
                    }
                }
            }
            .alert("Thông báo", isPresented: Binding(
                get: { cloud.errorMessage != nil },
                set: { if !$0 { cloud.errorMessage = nil } }
            )) {
                Button("OK") { cloud.errorMessage = nil }
            } message: { Text(cloud.errorMessage ?? "") }
        }
    }

    private func header(_ label: String, date: Date, badge: String? = nil) -> some View {
        HStack {
            Image(systemName: "person.crop.circle.fill")
                .font(.title2).foregroundStyle(appearance.cameraTheme.accent)
            VStack(alignment: .leading) {
                HStack(spacing: 6) {
                    Text(label).fontWeight(.semibold)
                    if let badge, let style = AppearanceSettings.BadgeStyle(rawValue: badge), style != .none {
                        Image(systemName: style.symbol)
                            .font(.caption)
                            .foregroundStyle(appearance.cameraTheme.accent)
                    }
                }
                Text(MomentFormat.date(date))
                    .font(.caption).foregroundStyle(Theme.muted)
            }
            Spacer()
        }
    }

    private var missingImage: some View {
        VStack {
            Image(systemName: "photo").font(.largeTitle)
            Text("Không tải được ảnh")
        }
        .foregroundStyle(Theme.muted)
        .frame(maxWidth: .infinity).frame(height: 250)
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "camera.macro")
                .font(.system(size: 56))
                .foregroundStyle(appearance.cameraTheme.accent)
            Text("Chưa có khoảnh khắc")
                .font(.title2.bold())
            Text("Mở tab Chụp ảnh để lưu khoảnh khắc đầu tiên.")
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 90)
    }

    private func status(_ title: String, message: String) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title).font(.caption.bold())
            Text(message).font(.subheadline)
        }
        .foregroundStyle(Theme.ink)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(appearance.cameraTheme.accent.opacity(0.23), in: RoundedRectangle(cornerRadius: 14))
    }
}


struct MomentVideoPlayer: View {
    let url: URL
    @State private var player: AVPlayer?

    var body: some View {
        Group {
            if let player {
                VideoPlayer(player: player)
            } else {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task(id: url) {
            player?.pause()
            player = AVPlayer(url: url)
        }
        .onDisappear { player?.pause() }
    }
}
