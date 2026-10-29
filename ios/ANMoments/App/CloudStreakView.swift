import SwiftUI
import Supabase

private struct CloudStreakDay: Decodable {
    let day: String
    let source: String
}
private struct CloudStreakWallet: Decodable {
    let credits: Int
}

struct CloudStreakView: View {
    @EnvironmentObject private var cloud: CloudService
    @State private var days: [CloudStreakDay] = []
    @State private var credits = 0
    @State private var loading = false
    @State private var errorMessage: String?
    @State private var loaded = false

    private var summary: StreakSummary {
        StreakEngine.summarize(
            dates: days.filter { $0.source == "post" }
                .compactMap { StreakEngine.date($0.day) },
            restoredDays: Set(days.filter { $0.source == "restored" }.map(\.day))
        )
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.orange)
                Text("\(summary.current)")
                    .font(.system(size: 85, weight: .heavy, design: .rounded))
                Text("ngày liên tiếp")
                    .font(.title3.bold())
                if !loaded {
                    ProgressView("Đang tải chuỗi...")
                } else {
                    HStack {
                        Label("Kỷ lục \(summary.longest)", systemImage: "trophy.fill")
                        Spacer()
                        Label("Còn \(credits) lượt", systemImage: "arrow.uturn.backward")
                    }
                    .padding()
                    .background(.white, in: RoundedRectangle(cornerRadius: 18))

                    if let missing = summary.missingDay {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Khôi phục ngày \(StreakEngine.key(missing))")
                                .font(.headline)
                            Button {
                                Task { await restore(missing) }
                            } label: {
                                Label("Dùng một lượt khôi phục", systemImage: "arrow.uturn.backward")
                                    .frame(maxWidth: .infinity).padding(16)
                                    .background(Theme.gold, in: RoundedRectangle(cornerRadius: 16))
                            }
                            .disabled(loading || credits < 1)
                        }
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    }
                    Text("Chuỗi đám mây dùng ngày UTC; đồng bộ qua Supabase trên các thiết bị. Khôi phục không tạo bài đăng giả.")
                        .font(.caption)
                        .foregroundStyle(Theme.muted)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
        }
        .background(Theme.cream.ignoresSafeArea())
        .navigationTitle("Chuỗi đã đồng bộ")
        .task { await reload() }
        .refreshable { await reload() }
        .alert("Thông báo", isPresented: Binding(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK") { error = nil }
        } message: { Text(errorMessage ?? "") }
    }

    private func reload() async {
        guard let api = cloud.sharedClient, let me = cloud.userID else { return }
        loading = true
        defer { loading = false }
        do {
            days = try await api.from("streak_days")
                .select("day,source")
                .eq("user_id", value: me.uuidString)
                .order("day", ascending: false)
                .limit(3650).execute().value
            let wallet: CloudStreakWallet = try await api.from("streak_wallets")
                .select("credits").eq("user_id", value: me.uuidString)
                .single().execute().value
            credits = wallet.credits
            loaded = true
        } catch {
            errorMessage = "Không tải được chuỗi. Kiểm tra streak_extensions.sql: \(error.localizedDescription)"
        }
    }

    private func restore(_ day: Date) async {
        guard let api = cloud.sharedClient else { return }
        loading = true
        defer { loading = false }
        do {
            try await api.rpc("restore_streak",
                params: ["p_day": StreakEngine.key(day)]).execute()
            await reload()
        } catch { errorMessage = error.localizedDescription }
    }
}
