import SwiftUI
import PhotosUI
import UIKit
import AVKit
import UniformTypeIdentifiers

struct CaptureView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var appearance: AppearanceSettings
    @State private var cameraOpen = false
    @State private var videoCameraOpen = false
    @State private var pickerItem: PhotosPickerItem?
    @State private var image: UIImage?
    @State private var videoURL: URL?
    @State private var caption = ""
    @State private var selectedFriends: Set<UUID> = []
    @State private var alertText: String?
    @State private var sending = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Gửi một khoảnh khắc")
                                .font(.system(size: 27, weight: .bold, design: .rounded))
                            Text("Ảnh hoặc video tối đa 60 giây")
                                .font(.subheadline)
                                .foregroundStyle(Theme.muted)
                        }
                        Spacer()
                        Image(systemName: "sparkles.rectangle.stack.fill")
                            .font(.title2).foregroundStyle(appearance.cameraTheme.accent)
                    }
                    ZStack {
                        RoundedRectangle(cornerRadius: 30)
                            .fill(Color.white)
                            .shadow(color: appearance.cameraTheme.accent.opacity(0.15), radius: 15, y: 5)
                        if let videoURL {
                            VideoPlayer(player: AVPlayer(url: videoURL))
                                .frame(height: 340)
                                .clipShape(RoundedRectangle(cornerRadius: 30))
                                .overlay(alignment: .topTrailing) {
                                    Label("VIDEO", systemImage: "play.rectangle.fill")
                                        .font(.caption.bold())
                                        .padding(8)
                                        .background(appearance.cameraTheme.accent, in: Capsule())
                                        .padding(12)
                                }
                        } else if let image {
                            Image(uiImage: image)
                                .resizable().scaledToFill()
                                .frame(maxWidth: .infinity).frame(height: 340)
                                .clipped().clipShape(RoundedRectangle(cornerRadius: 30))
                        } else {
                            VStack(spacing: 14) {
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 64))
                                    .foregroundStyle(appearance.cameraTheme.accent)
                                Text("Một ngày bình thường cũng đáng nhớ")
                                    .font(.headline)
                                    .foregroundStyle(Theme.muted)
                                    .multilineTextAlignment(.center)
                            }
                        }
                    }
                    .frame(height: 340)

                    HStack(spacing: 10) {
                        Button {
                            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                                cameraOpen = true
                            } else { alertText = "Không tìm thấy camera." }
                        } label: {
                            Label("Ảnh", systemImage: "camera.fill")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(ActionButtonStyle(background: appearance.cameraTheme.accent))
                        Button {
                            if UIImagePickerController.isSourceTypeAvailable(.camera) &&
                               UIImagePickerController.availableMediaTypes(for: .camera)?
                                  .contains(UTType.movie.identifier) == true {
                                videoCameraOpen = true
                            } else { alertText = "Camera không hỗ trợ quay video." }
                        } label: {
                            Label("Video", systemImage: "video.fill")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(ActionButtonStyle(background: appearance.cameraTheme.accent.opacity(0.5)))
                    }
                    PhotosPicker(selection: $pickerItem, matching: .any(of: [.images, .videos])) {
                        Label("Chọn ảnh hoặc video từ thư viện", systemImage: "photo.on.rectangle")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(ActionButtonStyle(background: .white))

                    TextField("Viết lời nhắn...", text: $caption, axis: .vertical)
                        .lineLimit(2...6)
                        .onChange(of: caption) { _, newValue in
                            if newValue.count > 2000 { caption = String(newValue.prefix(2000)) }
                        }
                        .padding(16)
                        .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    Text("\(caption.count) / 2000 ký tự")
                        .font(.caption).foregroundStyle(Theme.muted)
                        .frame(maxWidth: .infinity, alignment: .trailing)

                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Chọn người nhận").font(.headline)
                            Spacer()
                            let count = cloud.enabled ? cloud.friends.count : album.friends.count
                            Text("\(count) bạn").font(.caption).foregroundStyle(Theme.muted)
                        }
                        Button(selectedFriends.count == (cloud.enabled ? cloud.friends.count : album.friends.count)
                               ? "Bỏ chọn tất cả" : "Chọn tất cả") {
                            let all = cloud.enabled
                                ? cloud.friends.map(\.id) : album.friends.map(\.id)
                            if selectedFriends.count == all.count {
                                selectedFriends.removeAll()
                            } else { selectedFriends = Set(all) }
                        }
                        .font(.subheadline.bold())
                        .disabled((cloud.enabled ? cloud.friends.isEmpty : album.friends.isEmpty))
                        if cloud.enabled {
                            if cloud.friends.isEmpty {
                                Text("Mời bạn bè ở tab Bạn bè để chia sẻ. Không chọn ai = lưu riêng.")
                                    .foregroundStyle(Theme.muted)
                            }
                            ForEach(cloud.friends) { friend in
                                friendToggle(friend.display_name, id: friend.id)
                            }
                        } else {
                            Text("Bản thử trên máy: chọn tên chỉ gắn nhãn, không gửi qua mạng.")
                                .font(.caption).foregroundStyle(Theme.muted)
                            ForEach(album.friends) { friend in
                                friendToggle(friend.name, id: friend.id)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(.white, in: RoundedRectangle(cornerRadius: 18))

                    Button {
                        Task { await publish() }
                    } label: {
                        HStack {
                            Spacer()
                            if sending { ProgressView() }
                            Text(cloud.enabled ? "Lưu / Chia sẻ" : "Lưu vào iPhone")
                            Image(systemName: "arrow.up.heart.fill")
                            Spacer()
                        }
                        .font(.headline)
                        .padding(18)
                        .background(appearance.cameraTheme.accent, in: RoundedRectangle(cornerRadius: 18))
                    }
                    .disabled((image == nil && videoURL == nil) || sending)
                }
                .padding(20)
            }
            .background(appearance.cameraTheme.background.ignoresSafeArea())
            .sheet(isPresented: $cameraOpen) {
                CameraPicker { selected in
                    image = selected
                    videoURL = nil
                }
                .ignoresSafeArea()
            }
            .sheet(isPresented: $videoCameraOpen) {
                VideoCameraPicker { selected in
                    Task {
                        do {
                            try await VideoMedia.validate(selected)
                            videoURL = selected
                            image = nil
                        } catch { alertText = error.localizedDescription }
                    }
                }
                .ignoresSafeArea()
            }
            .onChange(of: pickerItem) { _, item in
                guard let item else { return }
                Task {
                    if item.supportedContentTypes.contains(where: { $0.conforms(to: .movie) }) {
                        if let imported = try? await item.loadTransferable(type: ImportedMovie.self) {
                            do {
                                try await VideoMedia.validate(imported.url)
                                videoURL = imported.url
                                image = nil
                            } catch { alertText = error.localizedDescription }
                        } else {
                            alertText = "Không thể đọc video từ thư viện."
                        }
                    } else if let data = try? await item.loadTransferable(type: Data.self),
                              let loaded = UIImage(data: data) {
                        image = loaded
                        videoURL = nil
                    } else {
                        alertText = "Không thể đọc ảnh từ thư viện."
                    }
                    pickerItem = nil
                }
            }
            .alert("AN Moments", isPresented: Binding(
                get: { alertText != nil || cloud.errorMessage != nil },
                set: { if !$0 { alertText = nil; cloud.errorMessage = nil } }
            )) {
                Button("OK") { alertText = nil; cloud.errorMessage = nil }
            } message: { Text(alertText ?? cloud.errorMessage ?? "") }
        }
    }

    private func friendToggle(_ name: String, id: UUID) -> some View {
        Button {
            if selectedFriends.contains(id) { selectedFriends.remove(id) }
            else { selectedFriends.insert(id) }
        } label: {
            HStack {
                Image(systemName: "person.crop.circle.fill")
                    .foregroundStyle(appearance.cameraTheme.accent)
                Text(name)
                Spacer()
                Image(systemName: selectedFriends.contains(id) ? "checkmark.circle.fill" : "circle")
            }
            .foregroundStyle(Theme.ink)
            .padding(.vertical, 6)
        }
    }

    private func publish() async {
        guard image != nil || videoURL != nil else { return }
        sending = true
        defer { sending = false }
        if cloud.enabled {
            let recipients = Array(selectedFriends)
            let ok: Bool
            if let videoURL {
                ok = await cloud.publishVideo(url: videoURL, caption: caption, recipients: recipients)
            } else if let image {
                ok = await cloud.publish(image: image, caption: caption, recipients: recipients)
            } else { return }
            if ok {
                image = nil
                videoURL = nil
                caption = ""
                selectedFriends.removeAll()
                alertText = "Đã lưu khoảnh khắc."
            }
        } else {
            do {
                let names = album.friends.filter { selectedFriends.contains($0.id) }.map(\.name)
                if let videoURL {
                    try await album.addVideo(fileURL: videoURL, caption: caption, recipients: names)
                } else if let image {
                    try album.add(image: image, caption: caption, recipients: names)
                }
                image = nil
                videoURL = nil
                caption = ""
                selectedFriends.removeAll()
                alertText = "Đã lưu trên iPhone. Chưa gửi tới thiết bị khác."
            } catch { alertText = error.localizedDescription }
        }
    }
}

struct ActionButtonStyle: ButtonStyle {
    let background: Color
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.bold())
            .foregroundStyle(Theme.ink)
            .padding(17)
            .background(background, in: RoundedRectangle(cornerRadius: 17))
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
    }
}
