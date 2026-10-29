import SwiftUI

struct SocialHubView: View {
    @EnvironmentObject private var cloud: CloudService
    @State private var selection = 0

    var body: some View {
        VStack(spacing: 0) {
            Picker("Kết nối", selection: $selection) {
                Text("Bạn bè").tag(0)
                Text("Trò chuyện").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 20)
            .padding(.top, 12)

            if selection == 0 {
                FriendsView()
            } else {
                ChatHomeView()
            }
        }
        .background(Theme.cream.ignoresSafeArea())
    }
}

struct ChatHomeView: View {
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var social: SocialService
    @State private var groupOpen = false
    @State private var activeRoom: ChatRoom?

    var body: some View {
        NavigationStack {
            List {
                if !cloud.enabled {
                    ContentUnavailableView(
                        "Cần tài khoản",
                        systemImage: "bubble.left.and.bubble.right",
                        description: Text("Chat giữa hai thiết bị cần cấu hình Supabase riêng.")
                    )
                } else {
                    Section {
                        Button {
                            groupOpen = true
                        } label: {
                            Label("Tạo nhóm bạn thân", systemImage: "person.3.fill")
                        }
                    }
                    if !cloud.friends.isEmpty {
                        Section("Nhắn riêng") {
                            ForEach(cloud.friends) { friend in
                                Button {
                                    Task {
                                        activeRoom = await social.directChat(with: friend.id, cloud: cloud)
                                    }
                                } label: {
                                    Label(friend.display_name, systemImage: "person.crop.circle")
                                        .foregroundStyle(Theme.ink)
                                }
                            }
                        }
                    }
                    Section("Hội thoại") {
                        if social.rooms.isEmpty {
                            Text("Chưa có hội thoại. Chọn bạn bè để bắt đầu.")
                                .foregroundStyle(.secondary)
                        }
                        ForEach(social.rooms) { room in
                            NavigationLink {
                                ChatThreadView(room: room)
                            } label: {
                                Label(room.displayName,
                                      systemImage: room.isGroup ? "person.3.fill" : "bubble.left.fill")
                            }
                        }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.cream)
            .navigationTitle("Trò chuyện")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink {
                        ActivityInboxView()
                    } label: {
                        Image(systemName: "bell.badge")
                    }
                }
            }
            .task {
                if cloud.enabled { await social.loadRooms(cloud) }
            }
            .refreshable { await social.loadRooms(cloud) }
            .sheet(isPresented: $groupOpen) {
                GroupCreationView { room in
                    groupOpen = false
                    activeRoom = room
                }
            }
            .sheet(item: $activeRoom) { room in
                NavigationStack {
                    ChatThreadView(room: room)
                        .toolbar {
                            ToolbarItem(placement: .topBarTrailing) {
                                Button("Đóng") { activeRoom = nil }
                            }
                        }
                }
            }
            .alert("AN Moments", isPresented: Binding(
                get: { social.errorMessage != nil },
                set: { if !$0 { social.errorMessage = nil } }
            )) {
                Button("OK") { social.errorMessage = nil }
            } message: {
                Text(social.errorMessage ?? "")
            }
        }
    }
}

struct GroupCreationView: View {
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var social: SocialService
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var selected: Set<UUID> = []
    let didCreate: (ChatRoom) -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Tên nhóm") {
                    TextField("Ví dụ: Bạn thân đại học", text: $title)
                        .onChange(of: title) { _, newValue in
                            if newValue.count > 80 { title = String(newValue.prefix(80)) }
                        }
                }
                Section("Chọn bạn (tối đa 19)") {
                    ForEach(cloud.friends) { friend in
                        Button {
                            if selected.contains(friend.id) {
                                selected.remove(friend.id)
                            } else if selected.count < 19 {
                                selected.insert(friend.id)
                            }
                        } label: {
                            HStack {
                                Text(friend.display_name)
                                Spacer()
                                Image(systemName: selected.contains(friend.id) ?
                                    "checkmark.circle.fill" : "circle")
                            }
                        }
                        .foregroundStyle(Theme.ink)
                    }
                }
            }
            .navigationTitle("Nhóm mới")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Hủy") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Tạo") {
                        Task {
                            if let room = await social.groupChat(
                                title: title, friends: Array(selected), cloud: cloud
                            ) {
                                didCreate(room)
                            }
                        }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                              selected.isEmpty || social.loading)
                }
            }
        }
    }
}

struct ChatThreadView: View {
    @EnvironmentObject private var cloud: CloudService
    @EnvironmentObject private var social: SocialService
    @State private var message = ""
    let room: ChatRoom

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(social.messages[room.id] ?? []) { item in
                            let mine = item.sender_id == cloud.userID
                            HStack {
                                if mine { Spacer(minLength: 48) }
                                Text(item.body)
                                    .padding(.vertical, 11)
                                    .padding(.horizontal, 14)
                                    .background(
                                        mine ? Theme.gold : Color(.secondarySystemBackground),
                                        in: RoundedRectangle(cornerRadius: 17)
                                    )
                                    .foregroundStyle(Theme.ink)
                                    .frame(maxWidth: 310, alignment: mine ? .trailing : .leading)
                                if !mine { Spacer(minLength: 48) }
                            }
                            .id(item.id)
                        }
                    }
                    .padding(15)
                }
                .onChange(of: social.messages[room.id]?.count ?? 0) { _, _ in
                    if let last = social.messages[room.id]?.last?.id {
                        withAnimation { proxy.scrollTo(last, anchor: .bottom) }
                    }
                }
            }
            Divider()
            HStack(spacing: 12) {
                TextField("Nhắn một điều dễ thương...", text: $message, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(12)
                    .background(Color(.secondarySystemBackground),
                                in: RoundedRectangle(cornerRadius: 16))
                Button {
                    let value = message
                    Task {
                        if await social.send(value, to: room.id, cloud: cloud) {
                            message = ""
                        }
                    }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(Theme.gold)
                }
                .disabled(message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                          message.count > 2000)
                .accessibilityLabel("Gửi tin nhắn")
            }
            .padding(12)
        }
        .background(Theme.cream.ignoresSafeArea())
        .navigationTitle(room.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .task(id: room.id) {
            // Foreground-only short polling; not APNs or guaranteed Realtime.
            while !Task.isCancelled {
                await social.loadMessages(room.id, cloud: cloud)
                try? await Task.sleep(nanoseconds: 6_000_000_000)
            }
        }
        .alert("Tin nhắn", isPresented: Binding(
            get: { social.errorMessage != nil },
            set: { if !$0 { social.errorMessage = nil } }
        )) {
            Button("OK") { social.errorMessage = nil }
        } message: { Text(social.errorMessage ?? "") }
    }
}
