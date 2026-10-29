import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var editingName = ""
    @State private var showClear = false

    var body: some View {
        NavigationStack {
            Form {
                Section("AN Moments") {
                    Label("Phiên bản thử nghiệm 1.0", systemImage: "heart.square.fill")
                    LabeledContent("Chế độ", value: cloud.enabled ? "Kết nối Supabase" : "Chỉ trên iPhone")
                    if cloud.enabled {
                        LabeledContent("Username", value: cloud.myProfile?.handle ?? "—")
                    }
                }

                if cloud.enabled {
                    Section("Hồ sơ") {
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
                    Section("Dữ liệu thử trên máy") {
                        Text("Ảnh chỉ nằm trong bộ nhớ riêng của ứng dụng. Nếu gỡ app, dữ liệu có thể bị mất.")
                            .foregroundStyle(.secondary)
                        Button("Xóa mọi ảnh và bạn bè", role: .destructive) { showClear = true }
                    }
                }
                Section("Quyền riêng tư") {
                    Text("Không kết nối Telegram, không thu thập danh bạ. Quyền camera và thư viện chỉ được yêu cầu khi sử dụng.")
                        .font(.subheadline)
                    Text("Chỉ chia sẻ ảnh cho các tài khoản bạn chọn khi bật backend và hoàn tất kết bạn.")
                        .font(.subheadline)
                }
                Section("Tình trạng tính năng") {
                    LabeledContent("Camera / nhập ảnh", value: "Đã triển khai")
                    LabeledContent("Lịch sử / xuất ảnh", value: "Đã triển khai")
                    LabeledContent("Đồng bộ bạn bè", value: cloud.enabled ? "Cần kiểm thử thiết bị" : "Cần kết nối Supabase")
                    LabeledContent("Widget màn hình chính", value: "Mẫu mã nguồn riêng")
                    LabeledContent("Video / push notification", value: "Chưa triển khai")
                }
            }
            .navigationTitle("Cá nhân")
            .confirmationDialog("Xóa tất cả dữ liệu thử nghiệm?", isPresented: $showClear) {
                Button("Xóa toàn bộ", role: .destructive) { album.clearAll() }
            } message: {
                Text("Không thể khôi phục dữ liệu cục bộ sau khi xóa.")
            }
        }
    }
}
