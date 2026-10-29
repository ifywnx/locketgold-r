import SwiftUI
import AVKit

struct RecapView: View {
    @EnvironmentObject private var album: LocalAlbum
    @State private var exporting = false
    @State private var exportURL: URL?
    @State private var errorText: String?

    private var localPhotos: [LocalMoment] {
        Array(album.moments.filter { !$0.isVideo }.prefix(15))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                Image(systemName: "film.stack.fill")
                    .font(.system(size: 58))
                    .foregroundStyle(Theme.gold)
                Text("Video kỷ niệm")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                Text("Ghép tối đa 15 ảnh gần nhất trên iPhone thành một video tổng hợp. Mỗi ảnh xuất hiện 2 giây. Không tải dữ liệu lên máy chủ.")
                    .foregroundStyle(Theme.muted)
                    .multilineTextAlignment(.center)

                if let exportURL {
                    VideoPlayer(player: AVPlayer(url: exportURL))
                        .frame(height: 400)
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                    ShareLink(item: exportURL) {
                        Label("Lưu hoặc chia sẻ video", systemImage: "square.and.arrow.up")
                            .font(.headline)
                            .padding(16)
                            .frame(maxWidth: .infinity)
                            .background(Theme.gold, in: RoundedRectangle(cornerRadius: 16))
                    }
                    NavigationLink {
                        SoundtrackView(videoURL: exportURL)
                    } label: {
                        Label("Thêm nhạc từ Files", systemImage: "music.note")
                    }
                } else if localPhotos.isEmpty {
                    ContentUnavailableView("Chưa có ảnh trên máy", systemImage: "photo.stack")
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())]) {
                        ForEach(localPhotos) { photo in
                            if let image = album.image(for: photo) {
                                Image(uiImage: image).resizable().scaledToFill()
                                    .frame(height: 140).clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                    }
                    Button {
                        Task {
                            exporting = true
                            defer { exporting = false }
                            do {
                                let images = localPhotos.compactMap { album.image(for: $0) }
                                exportURL = try await RecapExporter.export(images: images)
                            } catch { errorText = error.localizedDescription }
                        }
                    } label: {
                        HStack {
                            if exporting { ProgressView() }
                            Text("Tạo video từ \(localPhotos.count) ảnh")
                        }
                        .padding(17)
                        .frame(maxWidth: .infinity)
                        .background(Theme.gold, in: RoundedRectangle(cornerRadius: 17))
                    }
                    .disabled(exporting)
                }
            }
            .padding(20)
        }
        .navigationTitle("Tổng hợp kỷ niệm")
        .background(Theme.cream.ignoresSafeArea())
        .alert("Không thể tạo video", isPresented: Binding(
            get: { errorText != nil },
            set: { if !$0 { errorText = nil } }
        )) {
            Button("OK") { errorText = nil }
        } message: { Text(errorText ?? "") }
    }
}
