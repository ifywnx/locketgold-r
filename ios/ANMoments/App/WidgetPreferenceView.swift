import SwiftUI

struct WidgetPreferenceView: View {
    @EnvironmentObject private var cloud: CloudService
    @State private var favorite: UUID?

    var body: some View {
        Form {
            Section("Ảnh từ người thân") {
                Picker("Ưu tiên ảnh", selection: $favorite) {
                    Text("Khoảnh khắc mới nhất").tag(Optional<UUID>.none)
                    ForEach(cloud.friends) { friend in
                        Text(friend.display_name).tag(Optional(friend.id))
                    }
                }
                .onChange(of: favorite) { _, newValue in
                    WidgetBridge.chooseFriend(newValue)
                    Task { await cloud.refresh() }
                }
                Text("Khi bạn mở ứng dụng hoặc tải lại ảnh, widget sẽ ưu tiên ảnh mới nhất của người này.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Section("Tình trạng cập nhật") {
                Text("Bản mẫu hiện đồng bộ khi ứng dụng đang chạy. Ảnh sẽ không tự xuất hiện ngay trên màn hình chính khi ứng dụng đóng. APNs WidgetKit và App Groups vẫn cần cấu hình Apple Developer.")
                    .font(.subheadline)
                Text("Nếu đổi người được ưu tiên mà người đó chưa gửi ảnh, widget sẽ hiển thị trạng thái trống thay vì ảnh của người trước.")
                    .font(.caption)
            }
        }
        .navigationTitle("Widget người thân")
        .onAppear { favorite = WidgetBridge.preferredFriend() }
    }
}
