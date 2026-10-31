import WidgetKit
import SwiftUI
import UIKit

struct LatestEntry: TimelineEntry {
    let date: Date
    let image: UIImage?
    let theme: String
}

struct LatestProvider: TimelineProvider {
    private func snapshot() -> LatestEntry {
        let group = "group.com.ifywnx.anmoments"
        let url = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: group
        )?.appendingPathComponent("latest.jpg")
        let image = url.flatMap { UIImage(contentsOfFile: $0.path) }
        let theme = UserDefaults(suiteName: group)?.string(forKey: "widget.theme") ?? "gold"
        return LatestEntry(date: Date(), image: image, theme: theme)
    }

    func placeholder(in context: Context) -> LatestEntry {
        LatestEntry(date: Date(), image: nil, theme: "gold")
    }

    func getSnapshot(in context: Context, completion: @escaping (LatestEntry) -> Void) {
        completion(snapshot())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LatestEntry>) -> Void) {
        let entry = snapshot()
        // Content is pushed by the containing app using reloadTimelines;
        // the scheduled refresh is a fallback, NOT instant push delivery.
        completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600))))
    }
}

struct LatestWidgetView: View {
    let entry: LatestEntry

    private var borderColor: Color {
        switch entry.theme {
        case "rose": .pink
        case "lavender": .purple
        case "ocean": .cyan
        case "forest": .green
        case "night": .indigo
        default: .orange
        }
    }

    var body: some View {
        ZStack {
            if let image = entry.image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Color(red: 1.0, green: 0.84, blue: 0.38)
                VStack(spacing: 6) {
                    Image(systemName: "heart.square.fill")
                        .font(.system(size: 34))
                    Text("AN Moments")
                        .font(.headline)
                    Text("Mở app để chọn khoảnh khắc")
                        .font(.caption2)
                        .multilineTextAlignment(.center)
                }
                .foregroundStyle(.black.opacity(0.8))
                .padding()
            }
        }
        .overlay {
            RoundedRectangle(cornerRadius: 18).strokeBorder(borderColor, lineWidth: 6)
        }
        .containerBackground(for: .widget) { Color.white }
        .widgetURL(URL(string: "anmoments://open"))
    }
}

struct LatestMomentWidget: Widget {
    let kind = "ANMomentsLatest"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LatestProvider()) { entry in
            LatestWidgetView(entry: entry)
        }
        .configurationDisplayName("Khoảnh khắc mới nhất")
        .description("Ảnh được đồng bộ gần đây nhất từ AN Moments.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct ANMomentsWidgets: WidgetBundle {
    var body: some Widget { LatestMomentWidget() }
}
