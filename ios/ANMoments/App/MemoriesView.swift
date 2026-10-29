import SwiftUI

struct MemoriesView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var previewLocal: LocalMoment?
    private let columns = [GridItem(.flexible(), spacing: 9), GridItem(.flexible(), spacing: 9)]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Text("Kỷ niệm")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                    Text("Những bức ảnh bạn muốn giữ mãi.")
                        .foregroundStyle(Theme.muted)
                    LazyVGrid(columns: columns, spacing: 9) {
                        if cloud.enabled {
                            ForEach(cloud.moments) { moment in
                                AsyncImage(url: moment.signedURL) { phase in
                                    if let image = phase.image {
                                        image.resizable().scaledToFill()
                                    } else {
                                        Rectangle().fill(Theme.gold.opacity(0.2))
                                            .overlay(Image(systemName: "photo").foregroundStyle(Theme.muted))
                                    }
                                }
                                .frame(height: 190).clipped()
                                .clipShape(RoundedRectangle(cornerRadius: 18))
                            }
                        } else {
                            ForEach(album.moments) { moment in
                                if let image = album.image(for: moment) {
                                    Button {
                                        previewLocal = moment
                                    } label: {
                                        Image(uiImage: image).resizable().scaledToFill()
                                            .frame(height: 190).clipped()
                                            .clipShape(RoundedRectangle(cornerRadius: 18))
                                    }
                                }
                            }
                        }
                    }
                    if (cloud.enabled ? cloud.moments.isEmpty : album.moments.isEmpty) {
                        ContentUnavailableView(
                            "Chưa có kỷ niệm",
                            systemImage: "square.grid.2x2",
                            description: Text("Ảnh được chụp hoặc chọn sẽ xuất hiện ở đây.")
                        )
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .sheet(item: $previewLocal) { moment in
                NavigationStack {
                    VStack(spacing: 12) {
                        if let image = album.image(for: moment) {
                            Image(uiImage: image).resizable().scaledToFit()
                                .frame(maxHeight: 530)
                        }
                        Text(moment.caption)
                        ShareLink(item: album.exportURL(for: moment)) {
                            Label("Chia sẻ ảnh", systemImage: "square.and.arrow.up")
                        }
                    }
                    .padding()
                    .toolbar { ToolbarItem(placement: .topBarTrailing) {
                        Button("Đóng") { previewLocal = nil }
                    } }
                }
            }
        }
    }
}
