import Foundation
import WidgetKit

// App Group bridge is dormant unless the optional Widget target and
// matching App Groups entitlement have been enabled in Xcode.
enum WidgetBridge {
    static let group = "group.com.ifywnx.anmoments"
    static let imageName = "latest.jpg"
    static let borderKey = "widget.theme"
    private static let favoriteKey = "anmoments.widget.favoriteSender"

    static func preferredFriend() -> UUID? {
        guard let value = UserDefaults.standard.string(forKey: favoriteKey)
        else { return nil }
        return UUID(uuidString: value)
    }

    static func chooseFriend(_ id: UUID?) {
        if let id {
            UserDefaults.standard.set(id.uuidString, forKey: favoriteKey)
        } else {
            UserDefaults.standard.removeObject(forKey: favoriteKey)
        }
    }

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
