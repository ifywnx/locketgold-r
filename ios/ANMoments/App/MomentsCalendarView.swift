import SwiftUI

struct MomentsCalendarView: View {
    @EnvironmentObject private var album: LocalAlbum
    @EnvironmentObject private var cloud: CloudService
    @State private var selectedDate = Date()

    private var localToday: [LocalMoment] {
        album.moments.filter {
            Calendar.current.isDate($0.createdAt, inSameDayAs: selectedDate)
        }
    }
    private var remoteToday: [RemoteMoment] {
        cloud.moments.filter {
            Calendar.current.isDate($0.date, inSameDayAs: selectedDate)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                DatePicker(
                    "Chọn ngày",
                    selection: $selectedDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .tint(Theme.gold)
                .padding(12)
                .background(.white, in: RoundedRectangle(cornerRadius: 18))

                Text(selectedDate.formatted(date: .complete, time: .omitted))
                    .font(.headline)
                if cloud.enabled {
                    ForEach(remoteToday) { moment in
                        HStack {
                            if moment.isVideo {
                                Image(systemName: "play.rectangle.fill")
                                    .font(.largeTitle)
                                    .foregroundStyle(Theme.gold)
                            } else {
                                AsyncImage(url: moment.signedURL) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    Image(systemName: "photo")
                                }
                                .frame(width: 110, height: 110)
                                .clipped()
                            }
                            Text(moment.caption ?? "Khoảnh khắc")
                                .lineLimit(3)
                            Spacer()
                        }
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    }
                } else {
                    ForEach(localToday) { moment in
                        HStack(spacing: 14) {
                            if let image = album.image(for: moment) {
                                Image(uiImage: image)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 110, height: 110)
                                    .clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                if moment.isVideo { Label("Video", systemImage: "play.fill") }
                                Text(moment.caption.isEmpty ? "Khoảnh khắc" : moment.caption)
                                    .lineLimit(3)
                            }
                            Spacer()
                        }
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 18))
                    }
                }
                if (cloud.enabled ? remoteToday.isEmpty : localToday.isEmpty) {
                    ContentUnavailableView(
                        "Không có khoảnh khắc ngày này",
                        systemImage: "calendar.badge.exclamationmark"
                    )
                }
                if cloud.enabled {
                    Text("Lịch đám mây hiện chỉ hiển thị tối đa 100 khoảnh khắc gần nhất đã tải.")
                        .font(.caption)
                        .foregroundStyle(Theme.muted)
                }
            }
            .padding(18)
        }
        .navigationTitle("Lịch kỷ niệm")
        .background(Theme.cream.ignoresSafeArea())
    }
}
