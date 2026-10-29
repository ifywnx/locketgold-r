import SwiftUI
import MessageUI

struct FriendsView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var input = ""
    @State private var showContactPicker = false
    @State private var smsRecipient: String?
    @State private var pendingInvite: String?
    @State private var inviteMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    Text("Bạn bè thân thiết")
                        .font(.system(size: 29, weight: .bold, design: .rounded))

                    if cloud.enabled {
                        HStack {
                            Text("Tên của bạn: @\(cloud.myProfile?.handle ?? "đang tải")")
                                .font(.subheadline)
                            Spacer()
                            if let handle = cloud.myProfile?.handle {
                                ShareLink(item: "@" + handle) {
                                    Image(systemName: "square.and.arrow.up")
                                }
                                .accessibilityLabel("Chia sẻ username")
                            }
                        }
                        Text("Thêm bạn bằng tên người dùng. Họ phải đồng ý trước khi hai người chia sẻ ảnh.")
                        HStack {
                            if let handle = cloud.myProfile?.handle {
                                ShareLink(item: "Thêm mình trên AN Moments: @\(handle). anmoments://invite/\(handle)") {
                                    Label("Chia sẻ lời mời", systemImage: "square.and.arrow.up")
                                }
                            }
                            Spacer()
                            Button {
                                if MFMessageComposeViewController.canSendText() {
                                    showContactPicker = true
                                } else {
                                    inviteMessage = "iPhone này chưa hỗ trợ gửi SMS. Hãy dùng mục Chia sẻ lời mời."
                                }
                            } label: {
                                Label("Mời từ danh bạ", systemImage: "person.crop.circle.badge.plus")
                            }
                        }
                        .font(.subheadline)
                            .foregroundStyle(Theme.muted)
                    } else {
                        Text("Danh sách trong bản thử chỉ nằm trên máy này. Chưa thể gửi ảnh sang iPhone khác.")
                            .foregroundStyle(Theme.muted)
                    }

                    HStack(spacing: 10) {
                        TextField(cloud.enabled ? "Nhập @tên_người_dùng" : "Tên bạn bè", text: $input)
                            .textInputAutocapitalization(.never)
                            .padding(15)
                            .background(.white, in: RoundedRectangle(cornerRadius: 14))
                        Button {
                            let submittedName = input
                            input = ""
                            if cloud.enabled {
                                Task { await cloud.requestFriend(handle: submittedName) }
                            } else {
                                album.addFriend(submittedName)
                            }
                        } label: {
                            Image(systemName: "plus")
                                .font(.headline.bold())
                                .padding(17)
                                .background(Theme.gold, in: RoundedRectangle(cornerRadius: 14))
                        }
                        .disabled(input.trimmingCharacters(in: .whitespaces).isEmpty)
                    }

                    if cloud.enabled && !cloud.requests.isEmpty {
                        VStack(alignment: .leading, spacing: 15) {
                            Text("Lời mời đang chờ").font(.headline)
                            ForEach(cloud.requests) { request in
                                HStack {
                                    Text(cloud.requesterNames[request.from_user] ?? "Tài khoản " + String(request.from_user.uuidString.prefix(8)))
                                        .font(.subheadline)
                                    Spacer()
                                    Button("Chấp nhận") {
                                        Task { await cloud.acceptFriend(requestID: request.id) }
                                    }
                                    .font(.subheadline.bold())
                                }
                            }
                        }
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 20))
                    }

                    VStack(alignment: .leading, spacing: 14) {
                        Text("Danh sách")
                            .font(.headline)
                        if cloud.enabled {
                            ForEach(cloud.friends) { friend in
                                HStack {
                                    personRow(name: friend.display_name, subtitle: "@"+friend.handle)
                                    Spacer()
                                    Button(role: .destructive) {
                                        Task { await cloud.removeFriend(friend.id) }
                                    } label: {
                                        Image(systemName: "person.crop.circle.badge.minus")
                                    }
                                    .accessibilityLabel("Hủy kết bạn với " + friend.display_name)
                                }
                            }
                        } else {
                            ForEach(album.friends) { friend in
                                HStack {
                                    personRow(name: friend.name, subtitle: "Tên thử nghiệm")
                                    Spacer()
                                    Button(role: .destructive) {
                                        album.removeFriend(friend.id)
                                    } label: {
                                        Image(systemName: "minus.circle")
                                    }
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(.white, in: RoundedRectangle(cornerRadius: 20))
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .task { checkIncomingInvite() }
            .onOpenURL { _ in checkIncomingInvite() }
            .sheet(isPresented: $showContactPicker) {
                ContactInvitePicker { phone in
                    smsRecipient = phone
                }
            }
            .sheet(item: Binding(
                get: { smsRecipient.map { SMSRecipient(id: $0) } },
                set: { smsRecipient = $0?.id }
            )) { contact in
                InviteSMS(recipient: contact.id, handle: cloud.myProfile?.handle ?? "")
            }
            .confirmationDialog("Gửi lời mời kết bạn tới @\(pendingInvite ?? "")?",
                                isPresented: Binding(
                                    get: { pendingInvite != nil },
                                    set: { if !$0 { pendingInvite = nil } }
                                )) {
                Button("Gửi lời mời") {
                    let handle = pendingInvite ?? ""
                    pendingInvite = nil
                    Task { await cloud.requestFriend(handle: handle) }
                }
                Button("Hủy", role: .cancel) { pendingInvite = nil }
            }
            .alert("Mời bạn bè", isPresented: Binding(
                get: { inviteMessage != nil },
                set: { if !$0 { inviteMessage = nil } }
            )) {
                Button("OK") { inviteMessage = nil }
            } message: { Text(inviteMessage ?? "") }
            .refreshable { await cloud.refresh() }
            .alert("Thông báo", isPresented: Binding(
                get: { cloud.errorMessage != nil || cloud.infoMessage != nil },
                set: { if !$0 { cloud.errorMessage = nil; cloud.infoMessage = nil } }
            )) {
                Button("OK") { cloud.errorMessage = nil; cloud.infoMessage = nil }
            } message: {
                Text(cloud.errorMessage ?? cloud.infoMessage ?? "")
            }
        }
    }

    private func checkIncomingInvite() {
        guard cloud.enabled,
              let handle = UserDefaults.standard.string(forKey: "anmoments.pendingInvite"),
              !handle.isEmpty else { return }
        UserDefaults.standard.removeObject(forKey: "anmoments.pendingInvite")
        pendingInvite = handle
    }

    private func personRow(name: String, subtitle: String) -> some View {
        HStack(spacing: 11) {
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 35))
                .foregroundStyle(Theme.gold)
            VStack(alignment: .leading, spacing: 4) {
                Text(name).fontWeight(.semibold)
                Text(subtitle).font(.caption).foregroundStyle(Theme.muted)
            }
        }
    }
}

private struct SMSRecipient: Identifiable {
    let id: String
}
