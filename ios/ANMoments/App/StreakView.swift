import SwiftUI

struct StreakView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var restored: Set<String> = []
    @State private var credits: Int = 1

    private var dates: [Date] {
        cloud.enabled
            ? cloud.moments.filter { $0.author_id == cloud.userID }.map(\.date)
            : album.moments.map(\.createdAt)
    }

    private var summary: StreakSummary {
        StreakEngine.summarize(dates: dates, restoredDays: restored)
    }

    private var storageNamespace: String {
        cloud.userID?.uuidString ?? "local"
    }
    private var restoreKey: String { "anmoments.restored.\(storageNamespace)" }
    private var creditsKey: String { "anmoments.credits.\(storageNamespace)" }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 58))
                        .foregroundStyle(.orange)
                    Text("\(summary.current)")
                        .font(.system(size: 80, weight: .heavy, design: .rounded))
                    Text("ngày liên tiếp")
                        .font(.title3.bold())
                    Text(summary.todayPosted
                         ? "Bạn đã lưu khoảnh khắc hôm nay."
                         : "Đăng một khoảnh khắc để duy trì chuỗi.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.muted)
                        .multilineTextAlignment(.center)
                    HStack {
                        Label("Kỷ lục \(summary.longest)", systemImage: "trophy.fill")
                        Spacer()
                        Label("\(credits) lượt khôi phục", systemImage: "arrow.uturn.backward")
                    }
                    .font(.subheadline.bold())
                    .padding(18)
                    .background(.white, in: RoundedRectangle(cornerRadius: 20))

                    if let missing = summary.missingDay {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Khôi phục chuỗi").font(.headline)
                            Text("Bạn bỏ lỡ ngày \(missing.formatted(date: .abbreviated, time: .omitted)). Khôi phục chỉ đánh dấu ngày nghỉ trong bộ đếm, không tạo bài đăng giả.")
                            Button {
                                restore(missing)
                            } label: {
                                Label("Dùng một lượt khôi phục", systemImage: "arrow.uturn.backward.circle.fill")
                                    .padding()
                                    .frame(maxWidth: .infinity)
                                    .background(Theme.gold, in: RoundedRectangle(cornerRadius: 16))
                            }
                            .disabled(credits == 0)
                        }
                        .padding(16)
                        .background(.white, in: RoundedRectangle(cornerRadius: 20))
                    } else {
                        Text("Không có ngày bị lỡ đủ điều kiện để khôi phục.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.muted)
                    }

                    Text("Đây là bộ đếm thử nghiệm của AN Moments. Lượt khôi phục được lưu trên iPhone, không đồng bộ với tài khoản Locket hoặc thiết bị khác. Khi bật cloud, dữ liệu bài đăng chỉ tải tối đa 100 mục gần nhất.")
                        .font(.caption)
                        .foregroundStyle(Theme.muted)
                        .padding(.top, 16)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
            }
            .background(Theme.cream.ignoresSafeArea())
            .navigationTitle("Chuỗi khoảnh khắc")
            .task(id: storageNamespace) { load() }
        }
    }

    private func load() {
        let saved = UserDefaults.standard.string(forKey: restoreKey) ?? ""
        restored = Set(saved.split(separator: ",").map(String.init))
        let defaults = UserDefaults.standard
        credits = defaults.object(forKey: creditsKey) as? Int ?? 1
    }

    private func restore(_ day: Date) {
        guard credits > 0, summary.missingDay != nil else { return }
        restored.insert(StreakEngine.key(day))
        credits -= 1
        UserDefaults.standard.set(restored.sorted().joined(separator: ","), forKey: restoreKey)
        UserDefaults.standard.set(credits, forKey: creditsKey)
    }
}
