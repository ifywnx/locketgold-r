import Foundation
import WidgetKit

// App Group bridge is dormant unless the optional Widget target and
// matching App Groups entitlement have been enabled in Xcode.
enum WidgetBridge {
    static let group = "group.com.ifywnx.anmoments"
    static let imageName = "latest.jpg"
    static let borderKey = "widget.theme"

    static func saveTheme(_ theme: String) {
        guard let defaults = UserDefaults(suiteName: group) else { return }
        defaults.set(theme, forKey: borderKey)
        WidgetCenter.shared.reloadTimelines(ofKind: "ANMomentsLatest")
    }

    static func saveLatest(data: Data?) {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: group
        ) else { return }

        let target = container.appendingPathComponent(imageName)
        if let data {
            try? data.write(to: target, options: .atomic)
        } else {
            try? FileManager.default.removeItem(at: target)
        }
        WidgetCenter.shared.reloadTimelines(ofKind: "ANMomentsLatest")
    }
}
