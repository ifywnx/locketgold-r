import SwiftUI
import AVKit

struct CloudRecapView: View {
    @EnvironmentObject private var cloud: CloudService
    @State private var exporting = false
    @State private var movie: URL?
    @State private var error: String?

    private var pictures: [RemoteMoment] {
        Array(cloud.moments.filter {
            !$0.isVideo && $0.author_id == cloud.userID
        }.prefix(15))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Image(systemName: "film.stack.fill")
                    .font(.system(size: 55)).foregroundStyle(Theme.gold)
                Text("Kỷ niệm trên đám mây")
                    .font(.title2.bold())
                Text("Tạo video 30 giây hoặc ngắn hơn từ tối đa 15 ảnh của chính bạn. Ảnh được tải qua liên kết tạm thời và dựng trên iPhone, không chuyển cho dịch vụ dựng video bên ngoài.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Theme.muted)

                if let movie {
                    VideoPlayer(player: AVPlayer(url: movie))
                        .frame(height: 410)
                    ShareLink(item: movie) {
                        Label("Lưu hoặc chia sẻ video", systemImage: "square.and.arrow.up")
                    }
                    .font(.headline)
                    NavigationLink {
                        SoundtrackView(videoURL: movie)
                    } label: {
                        Label("Thêm nhạc từ Files", systemImage: "music.note")
                    }
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())]) {
                        ForEach(pictures) { moment in
                            AsyncImage(url: moment.signedURL) { image in
                                image.resizable().scaledToFill()
                            } placeholder: {
                                ProgressView()
                            }
                            .frame(height: 155).clipped()
                            .clipShape(RoundedRectangle(cornerRadius: 13))
                        }
                    }
                    Button {
                        Task { await export() }
                    } label: {
                        HStack {
                            if exporting { ProgressView() }
                            Label("Dựng từ \(pictures.count) ảnh",
                                  systemImage: "play.rectangle.fill")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(16)
                        .background(Theme.gold, in: RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(pictures.isEmpty || exporting)
                }
                if pictures.isEmpty {
                    ContentUnavailableView(
                        "Chưa có ảnh trên đám mây",
                        systemImage: "photo.stack"
                    )
                }
            }
            .padding()
        }
        .background(Theme.cream.ignoresSafeArea())
        .navigationTitle("Video tổng hợp")
        .alert("Không tạo được video", isPresented: Binding(
            get: { error != nil },
            set: { if !$0 { error = nil } }
        )) {
            Button("OK") { error = nil }
        } message: { Text(error ?? "") }
    }

    private func export() async {
        exporting = true
        defer { exporting = false }
        do {
            var images: [UIImage] = []
            for moment in pictures {
                guard let url = moment.signedURL else { continue }
                let (data, response) = try await URLSession.shared.data(from: url)
                guard (response as? HTTPURLResponse)?.statusCode == 200,
                      data.count <= 20_000_000,
                      let image = UIImage(data: data) else {
                    throw NSError(domain: "ANMomentsCloudRecap", code: 1,
                                  userInfo: [NSLocalizedDescriptionKey:
                                    "Một ảnh riêng tư không thể tải về. Hãy tải lại thư viện."])
                }
                images.append(image)
            }
            guard !images.isEmpty else {
                throw NSError(domain: "ANMomentsCloudRecap", code: 2,
                              userInfo: [NSLocalizedDescriptionKey:
                                "Không có ảnh hợp lệ để ghép video."])
            }
            movie = try await RecapExporter.export(images: images)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
