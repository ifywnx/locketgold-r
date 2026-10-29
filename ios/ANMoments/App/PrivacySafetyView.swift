import SwiftUI

struct PrivacySafetyView: View {
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var social: SocialService
    @StateObject private var reminder = LocalReminders()

    @State private var handle = ""
    @State private var details = ""
    @State private var category = "spam"
    @State private var askBlock = false
    @State private var askDelete = false
    @State private var feedback: String?

    var body: some View {
        Form {
            Section("Thông báo") {
                Toggle("Nhắc lưu khoảnh khắc lúc 20:00", isOn: Binding(
                    get: { reminder.enabled },
                    set: { next in
                        Task {
                            if let message = await reminder.setEnabled(next) {
                                feedback = message
                            }
                        }
                    }
                ))
                Text("Đây là thông báo cục bộ trên iPhone. Tin nhắn và ảnh mới chưa có APNs push.")
                    .font(.caption).foregroundStyle(.secondary)
            }

            if cloud.enabled {
                Section("Chặn người dùng") {
                    TextField("Nhập @username", text: $handle)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Button("Chặn tài khoản", role: .destructive) {
                        askBlock = true
                    }
                    .disabled(handle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    if !social.blockedUsers.isEmpty {
                        Text("Tài khoản đã chặn (ID rút gọn)")
                            .font(.caption).foregroundStyle(.secondary)
                        ForEach(Array(social.blockedUsers).sorted(by: {
                            $0.uuidString < $1.uuidString
                        }), id: \.self) { id in
                            HStack {
                                Text(String(id.uuidString.prefix(8)))
                                Spacer()
                                Button("Bỏ chặn") {
                                    Task { await social.unblock(id, cloud: cloud) }
                                }
                            }
                        }
                    }
                }

                Section("Báo cáo tài khoản") {
                    Picker("Lý do", selection: $category) {
                        Text("Spam").tag("spam")
                        Text("Quấy rối").tag("harassment")
                        Text("Nội dung không phù hợp").tag("inappropriate")
                        Text("Khác").tag("other")
                    }
                    TextField("Mô tả vấn đề", text: $details, axis: .vertical)
                        .lineLimit(2...5)
                    Button("Gửi báo cáo") {
                        Task {
                            await social.report(handle: handle, category: category,
                                                details: details, cloud: cloud)
                        }
                    }
                    .disabled(handle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    Text("Báo cáo được lưu để quản trị viên xử lý; ứng dụng hiện chưa có hệ thống kiểm duyệt tự động hoặc nhân sự phản hồi.")
                        .font(.caption).foregroundStyle(.secondary)
                }

                Section("Tài khoản và dữ liệu") {
                    Button("Gửi yêu cầu xóa tài khoản", role: .destructive) {
                        askDelete = true
                    }
                    Text("Yêu cầu chỉ được đưa vào hàng chờ. Bạn vẫn cần máy chủ quản trị xử lý dữ liệu, tệp lưu trữ và tài khoản Auth; thao tác này không xóa ngay.")
                        .font(.caption).foregroundStyle(.secondary)
                }
            } else {
                Section("Quyền riêng tư khi dùng thử offline") {
                    Text("Bạn đang dùng chế độ lưu trên iPhone. Không có tài khoản đám mây để báo cáo hoặc chặn.")
                    Text("Ảnh/video được lưu cục bộ. Xóa ứng dụng có thể làm mất nội dung.")
                }
            }
        }
        .navigationTitle("An toàn & dữ liệu")
        .scrollContentBackground(.hidden)
        .background(Theme.cream)
        .task { await social.loadBlocks(cloud) }
        .confirmationDialog("Chặn @" + handle + "?", isPresented: $askBlock) {
            Button("Chặn", role: .destructive) {
                Task { await social.block(handle: handle, cloud: cloud) }
            }
        } message: {
            Text("Xóa quan hệ bạn bè và từ chối tin nhắn mới giữa hai tài khoản. Nội dung cũ có thể vẫn còn.")
        }
        .confirmationDialog("Yêu cầu xóa tài khoản?", isPresented: $askDelete) {
            Button("Tạo yêu cầu", role: .destructive) {
                Task { await social.requestAccountDeletion(cloud) }
            }
        } message: {
            Text("Tài khoản chưa bị xóa ngay. Việc xóa cần quy trình quản trị an toàn phía server.")
        }
        .alert("AN Moments", isPresented: Binding(
            get: { social.errorMessage != nil || social.notice != nil || feedback != nil },
            set: { if !$0 {
                social.errorMessage = nil
                social.notice = nil
                feedback = nil
            }}
        )) {
            Button("OK") {
                social.errorMessage = nil
                social.notice = nil
                feedback = nil
            }
        } message: {
            Text(social.errorMessage ?? social.notice ?? feedback ?? "")
        }
    }
}
