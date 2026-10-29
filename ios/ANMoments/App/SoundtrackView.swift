import SwiftUI
import UniformTypeIdentifiers
import AVKit

struct SoundtrackView: View {
    let videoURL: URL
    @State private var showingPicker = false
    @State private var processing = false
    @State private var output: URL?
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                Image(systemName: "music.note.list")
                    .font(.system(size: 57)).foregroundStyle(Theme.gold)
                Text("Thêm nhạc của bạn")
                    .font(.title2.bold())
                Text("Chọn một tệp âm thanh từ Files mà bạn tự tạo hoặc có quyền sử dụng. AN Moments không cung cấp các bài hát thương mại.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Theme.muted)

                VideoPlayer(player: AVPlayer(url: output ?? videoURL))
                    .frame(height: 420)
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                Button {
                    showingPicker = true
                } label: {
                    HStack {
                        if processing { ProgressView() }
                        Label("Chọn tệp nhạc từ Files", systemImage: "folder")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(16)
                    .background(Theme.gold, in: RoundedRectangle(cornerRadius: 14))
                }
                .disabled(processing)
                if let output {
                    ShareLink(item: output) {
                        Label("Lưu hoặc chia sẻ video có nhạc",
                              systemImage: "square.and.arrow.up")
                    }
                    .font(.headline)
                }
            }
            .padding(20)
        }
        .navigationTitle("Nhạc nền")
        .background(Theme.cream.ignoresSafeArea())
        .fileImporter(isPresented: $showingPicker,
                      allowedContentTypes: [.audio]) { result in
            do {
                let selected = try result.get()
                let access = selected.startAccessingSecurityScopedResource()
                defer { if access { selected.stopAccessingSecurityScopedResource() } }
                let destination = FileManager.default.temporaryDirectory
                    .appendingPathComponent(UUID().uuidString)
                    .appendingPathExtension(selected.pathExtension.isEmpty
                                            ? "m4a" : selected.pathExtension)
                try FileManager.default.copyItem(at: selected, to: destination)
                Task {
                    processing = true
                    defer { processing = false }
                    do {
                        output = try await SoundtrackExporter.addAudio(
                            videoURL: videoURL, musicURL: destination
                        )
                    } catch {
                        errorMessage = error.localizedDescription
                    }
                }
            } catch {
                errorMessage = error.localizedDescription
            }
        }
        .alert("Nhạc nền", isPresented: Binding(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
    }
}
