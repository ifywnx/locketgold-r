import SwiftUI
import PhotosUI
import UIKit

struct CaptureView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var cameraOpen = false
    @State private var pickerItem: PhotosPickerItem?
    @State private var image: UIImage?
    @State private var caption = ""
    @State private var selectedFriends: Set<UUID> = []
    @State private var alertText: String?
    @State private var sending = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    Text("Gửi một khoảnh khắc")
                        .font(.system(size: 27, weight: .bold, design: .rounded))
                        .frame(maxWidth: .infinity, alignment: .leading)
                    ZStack {
                        RoundedRectangle(cornerRadius: 30)
                            .fill(Color.white)
                            .shadow(color: .black.opacity(0.05), radius: 14, y: 6)
                        if let image {
                            Image(uiImage: image)
                                .resizable()
                                .scaledToFill()
                                .frame(maxWidth: .infinity)
                                .frame(height: 350)
                                .clipped()
                                .clipShape(RoundedRectangle(cornerRadius: 30))
                        } else {
                            VStack(spacing: 14) {
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 64))
                                    .foregroundStyle(Theme.gold)
                                Text("Một ngày bình thường cũng đáng nhớ")
                                    .font(.headline)
                                    .foregroundStyle(Theme.muted)
                                    .multilineTextAlignment(.center)
                            }
                        }
                    }
                    .frame(height: 350)

                    HStack(spacing: 12) {
                        Button {
                            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                                cameraOpen = true
                            } else {
                                alertText = "Camera không khả dụng trên thiết bị này."
                            }
                        } label: {
                            Label("Chụp ảnh", systemImage: "camera.fill")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(ActionButtonStyle(background: Theme.gold))

                        PhotosPicker(selection: $pickerItem, matching: .images) {
                            Label("Chọn ảnh", systemImage: "photo.on.rectangle")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(ActionButtonStyle(background: .white))
                    }

                    TextField("Viết một dòng về khoảnh khắc...", text: $caption, axis: .vertical)
                        .lineLimit(2...4)
                        .padding(16)
                        .background(.white, in: RoundedRectangle(cornerRadius: 18))

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Chọn người nhận")
                            .font(.headline)
                        if cloud.enabled {
                            if cloud.friends.isEmpty {
                                Text("Chưa có bạn bè. Vào tab Bạn bè để mời họ.")
                                    .foregroundStyle(Theme.muted)
                            }
                            ForEach(cloud.friends) { friend in
                                friendToggle(friend.display_name, id: friend.id)
                            }
                        } else {
                            Text("Chế độ thử: chọn tên chỉ để gắn nhãn, không gửi qua mạng.")
                                .font(.caption)
                                .foregroundStyle(Theme.muted)
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
                            Text(cloud.enabled ? "Lưu / Chia sẻ" : "Lưu vào máy")
                            Image(systemName: "arrow.up.heart.fill")
                            Spacer()
                        }
                        .font(.headline)
                        .padding(18)
                        .background(Theme.gold, in: RoundedRectangle(cornerRadius: 18))
                    }
                    .disabled(image == nil || sending)
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .sheet(isPresented: $cameraOpen) {
                CameraPicker { captured in
                    image = captured
                }
                .ignoresSafeArea()
            }
            .onChange(of: pickerItem) { _, item in
                guard let item else { return }
                Task {
                    guard let data = try? await item.loadTransferable(type: Data.self),
                          let loaded = UIImage(data: data) else {
                        alertText = "Không đọc được ảnh được chọn."
                        return
                    }
                    image = loaded
                }
            }
            .alert("AN Moments", isPresented: Binding(
                get: { alertText != nil || cloud.errorMessage != nil },
                set: { if !$0 { alertText = nil; cloud.errorMessage = nil } }
            )) {
                Button("OK") { alertText = nil; cloud.errorMessage = nil }
            } message: {
                Text(alertText ?? cloud.errorMessage ?? "")
            }
        }
    }

    private func friendToggle(_ name: String, id: UUID) -> some View {
        Button {
            if selectedFriends.contains(id) { selectedFriends.remove(id) }
            else { selectedFriends.insert(id) }
        } label: {
            HStack {
                Image(systemName: "person.crop.circle.fill")
                    .foregroundStyle(Theme.gold)
                Text(name)
                Spacer()
                Image(systemName: selectedFriends.contains(id) ? "checkmark.circle.fill" : "circle")
            }
            .foregroundStyle(Theme.ink)
            .padding(.vertical, 6)
        }
    }

    private func publish() async {
        guard let image else { return }
        sending = true
        defer { sending = false }
        if cloud.enabled {
            let ok = await cloud.publish(
                image: image, caption: caption, recipients: Array(selectedFriends))
            if ok {
                self.image = nil
                caption = ""
                selectedFriends.removeAll()
                alertText = "Đã lưu khoảnh khắc."
            }
        } else {
            do {
                let names = album.friends.filter { selectedFriends.contains($0.id) }.map(\.name)
                try album.add(image: image, caption: caption, recipients: names)
                self.image = nil
                caption = ""
                selectedFriends.removeAll()
                alertText = "Đã lưu ảnh trên iPhone. Chưa gửi sang thiết bị khác."
            } catch {
                alertText = error.localizedDescription
            }
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
