import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var appearance: AppearanceSettings
    @State private var editingName = ""
    @State private var editingHandle = ""
    @State private var showClear = false
    @State private var iconMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 15) {
                        Image(systemName: "heart.square.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(appearance.cameraTheme.accent)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("AN Moments")
                                .font(.title2.bold())
                            HStack(spacing: 6) {
                                if appearance.badgeStyle != .none {
                                    Image(systemName: appearance.badgeStyle.symbol)
                                        .foregroundStyle(appearance.cameraTheme.accent)
                                }
                                Text("Bộ mở rộng Plus · bản thử nghiệm")
                                    .font(.caption)
                            }
                        }
                    }
                    LabeledContent("Chế độ", value: cloud.enabled ? "Kết nối Supabase" : "Trên thiết bị")
                    if cloud.enabled {
                        LabeledContent("Username", value: cloud.myProfile?.handle ?? "—")
                    }
                }

                Section("Tùy chỉnh không giới hạn") {
                    Picker("Giao diện camera", selection: $appearance.cameraTheme) {
                        ForEach(AppearanceSettings.CameraTheme.allCases) { theme in
                            Text(theme.name).tag(theme)
                        }
                    }
                    HStack(spacing: 7) {
                        ForEach(AppearanceSettings.CameraTheme.allCases) { theme in
                            Button {
                                appearance.cameraTheme = theme
                            } label: {
                                Circle()
                                    .fill(theme.accent)
                                    .frame(width: 30, height: 30)
                                    .overlay {
                                        if appearance.cameraTheme == theme {
                                            Image(systemName: "checkmark")
                                                .font(.caption.bold())
                                                .foregroundStyle(.white)
                                        }
                                    }
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel(theme.name)
                        }
                    }
                    Picker("Huy hiệu cá nhân", selection: $appearance.badgeStyle) {
                        ForEach(AppearanceSettings.BadgeStyle.allCases) { badge in
                            Label(badge.label, systemImage: badge.symbol.isEmpty ? "circle.slash" : badge.symbol)
                                .tag(badge)
                        }
                    }
                    .onChange(of: appearance.badgeStyle) { _, badge in
                        if cloud.enabled {
                            Task { await cloud.updateBadge(badge.rawValue) }
                        }
                    }
                    NavigationLink {
                        StreakView()
                    } label: {
                        Label("Chuỗi ngày & khôi phục", systemImage: "flame.fill")
                    }
                }

                Section("Đổi biểu tượng iPhone") {
                    Text("Tạo bởi AN Moments, không phải biểu tượng Gold chính thức của Locket.")
                        .font(.caption).foregroundStyle(.secondary)
                    Button("Biểu tượng Sunshine mặc định") {
                        appearance.setIcon(nil) { iconMessage = $0 ?? "Đã dùng biểu tượng Sunshine." }
                    }
                    Button("Biểu tượng Pink Love") {
                        appearance.setIcon("IconRose") { iconMessage = $0 ?? "Đã đổi sang Pink Love." }
                    }
                    Button("Biểu tượng Midnight") {
                        appearance.setIcon("IconMidnight") { iconMessage = $0 ?? "Đã đổi sang Midnight." }
                    }
                }

                if cloud.enabled {
                    Section("Hồ sơ") {
                        TextField("Username mới (a-z, 0-9, _)", text: $editingHandle)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                        Button("Đổi username") {
                            Task { await cloud.updateHandle(editingHandle) }
                        }
                        .disabled(editingHandle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        TextField("Tên hiển thị mới", text: $editingName)
                        Button("Lưu tên hiển thị") {
                            Task { await cloud.updateProfile(displayName: editingName) }
                        }
                        .disabled(editingName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        Button("Đăng xuất", role: .destructive) {
                            Task { await cloud.signOut() }
                        }
                    }
                } else {
                    Section("Dữ liệu trên iPhone") {
                        Text("Ảnh và video lưu riêng trên máy. Gỡ ứng dụng có thể xóa dữ liệu chưa sao lưu.")
                            .foregroundStyle(.secondary)
                        Button("Xóa ảnh, video và bạn bè", role: .destructive) {
                            showClear = true
                        }
                    }
                }

                Section("Quyền riêng tư") {
                    Text("Không sử dụng Telegram, không yêu cầu danh bạ, không tích hợp quảng cáo.")
                    Text("Chia sẻ đám mây chỉ tới người nhận đã được chọn. Phải thiết lập Supabase và kiểm thử chính sách trước khi phát hành.")
                }
                .font(.subheadline)

                Section("Tình trạng") {
                    LabeledContent("Camera, album, video ≤60s", value: "Đã viết mã")
                    LabeledContent("Lời nhắn ≤2000 ký tự", value: "Đã viết mã")
                    LabeledContent("Huy hiệu & theme camera", value: "Đã viết mã")
                    LabeledContent("Đổi icon", value: "Cần build iPhone")
                    LabeledContent("Lượt xem & kết bạn", value: cloud.enabled ? "Cần kiểm thử Supabase" : "Cần kết nối Supabase")
                    LabeledContent("Widget", value: "Cần bật App Groups")
                    LabeledContent("Thông báo đẩy", value: "Chưa triển khai")
                }
            }
            .navigationTitle("Cá nhân")
            .tint(appearance.cameraTheme.accent)
            .confirmationDialog("Xóa tất cả dữ liệu thử nghiệm?", isPresented: $showClear) {
                Button("Xóa toàn bộ", role: .destructive) { album.clearAll() }
            } message: {
                Text("Không thể khôi phục dữ liệu cục bộ sau khi xóa.")
            }
            .alert("Biểu tượng", isPresented: Binding(
                get: { iconMessage != nil },
                set: { if !$0 { iconMessage = nil } }
            )) {
                Button("OK") { iconMessage = nil }
            } message: {
                Text(iconMessage ?? "")
            }
        }
    }
}
