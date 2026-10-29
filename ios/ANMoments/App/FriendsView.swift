import SwiftUI

struct FriendsView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var input = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    Text("Bạn bè thân thiết")
                        .font(.system(size: 29, weight: .bold, design: .rounded))

                    if cloud.enabled {
                        Text("Tên của bạn: @\(cloud.myProfile?.handle ?? "đang tải")")
                            .font(.subheadline)
                        Text("Thêm bạn bằng tên người dùng. Họ phải đồng ý trước khi hai người chia sẻ ảnh.")
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
