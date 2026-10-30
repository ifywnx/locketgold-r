import SwiftUI

struct MemoriesView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var previewLocal: LocalMoment?
    @State private var previewRemote: RemoteMoment?
    private let columns = [
        GridItem(.flexible(), spacing: 9),
        GridItem(.flexible(), spacing: 9)
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Text("Kỷ niệm")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                    Text("Ảnh và video bạn muốn giữ mãi.")
                        .foregroundStyle(Theme.muted)
                    LazyVGrid(columns: columns, spacing: 9) {
                        if cloud.enabled {
                            ForEach(cloud.moments) { moment in
                                Button {
                                    previewRemote = moment
                                } label: {
                                    ZStack {
                                        if moment.isVideo {
                                            Rectangle()
                                                .fill(Theme.gold.opacity(0.17))
                                                .overlay {
                                                    VStack(spacing: 6) {
                                                        Image(systemName: "play.rectangle.fill")
                                                            .font(.largeTitle)
                                                        Text("Video")
                                                            .font(.caption.bold())
                                                    }
                                                    .foregroundStyle(Theme.ink)
                                                }
                                        } else {
                                            AsyncImage(url: moment.signedURL) { phase in
                                                if let image = phase.image {
                                                    image.resizable().scaledToFill()
                                                } else {
                                                    Rectangle()
                                                        .fill(Theme.gold.opacity(0.2))
                                                        .overlay(Image(systemName: "photo"))
                                                }
                                            }
                                        }
                                    }
                                    .frame(height: 190)
                                    .clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: 18))
                                }
                                .buttonStyle(.plain)
                                .onAppear {
                                    if moment.id == cloud.moments.last?.id {
                                        Task { await cloud.loadMoreMoments() }
                                    }
                                }
                            }
                        } else {
                            ForEach(album.moments) { moment in
                                if let image = album.image(for: moment) {
                                    Button {
                                        previewLocal = moment
                                    } label: {
                                        Image(uiImage: image)
                                            .resizable().scaledToFill()
                                            .frame(height: 190)
                                            .clipped()
                                            .overlay(alignment: .bottomTrailing) {
                                                if moment.isVideo {
                                                    Image(systemName: "play.rectangle.fill")
                                                        .foregroundStyle(.white)
                                                        .padding(8)
                                                }
                                            }
                                            .clipShape(RoundedRectangle(cornerRadius: 18))
                                    }
                                }
                            }
                        }
                    }
                    if cloud.enabled && cloud.loadingMoreMoments {
                        ProgressView("Đang tải thêm kỷ niệm...")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    } else if cloud.enabled && cloud.hasMoreMoments {
                        Text("Cuộn xuống để tải thêm kỷ niệm")
                            .font(.caption)
                            .foregroundStyle(Theme.muted)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    } else if cloud.enabled && !cloud.moments.isEmpty {
                        Text("Bạn đã xem hết lịch sử hiện có.")
                            .font(.caption)
                            .foregroundStyle(Theme.muted)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }

                    if (cloud.enabled ? cloud.moments.isEmpty : album.moments.isEmpty) {
                        ContentUnavailableView(
                            "Chưa có kỷ niệm",
                            systemImage: "square.grid.2x2",
                            description: Text("Ảnh và video đã lưu sẽ xuất hiện ở đây.")
                        )
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .refreshable { await cloud.refresh() }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 14) {
                        NavigationLink {
                            MomentsCalendarView()
                        } label: {
                            Image(systemName: "calendar")
                                .accessibilityLabel("Lịch kỷ niệm")
                        }
                        NavigationLink {
                            if cloud.enabled {
                                CloudRecapView()
                            } else {
                                RecapView()
                            }
                        } label: {
                            Image(systemName: "film.stack")
                                .accessibilityLabel("Tạo video kỷ niệm")
                        }
                    }
                }
            }
            .sheet(item: $previewRemote) { moment in
                NavigationStack {
                    VStack {
                        if moment.isVideo, let url = moment.signedURL {
                            MomentVideoPlayer(url: url).frame(height: 500)
                        } else if let url = moment.signedURL {
                            AsyncImage(url: url) { image in
                                image.resizable().scaledToFit()
                            } placeholder: { ProgressView() }
                        }
                        if let caption = moment.caption { Text(caption) }
                    }
                    .padding()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Đóng") { previewRemote = nil }
                        }
                    }
                }
            }
            .sheet(item: $previewLocal) { moment in
                NavigationStack {
                    VStack(spacing: 12) {
                        if moment.isVideo, let url = album.videoURL(for: moment) {
                            MomentVideoPlayer(url: url).frame(height: 480)
                        } else if let image = album.image(for: moment) {
                            Image(uiImage: image).resizable().scaledToFit()
                                .frame(maxHeight: 530)
                        }
                        Text(moment.caption)
                        ShareLink(item: album.exportURL(for: moment)) {
                            Label("Chia sẻ", systemImage: "square.and.arrow.up")
                        }
                    }
                    .padding()
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Đóng") { previewLocal = nil }
                        }
                    }
                }
            }
        }
    }
}
