import Foundation
import UserNotifications
import SwiftUI

@MainActor
final class LocalReminders: ObservableObject {
    @Published var enabled = UserDefaults.standard.bool(forKey: "anmoments.daily.reminder")
    private let identifier = "anmoments.daily.20"

    func setEnabled(_ newValue: Bool) async -> String? {
        let center = UNUserNotificationCenter.current()
        if !newValue {
            center.removePendingNotificationRequests(withIdentifiers: [identifier])
            enabled = false
            UserDefaults.standard.set(false, forKey: "anmoments.daily.reminder")
            return nil
        }

        do {
            let allowed = try await center.requestAuthorization(options: [.alert, .sound])
            guard allowed else { return "Bạn chưa cấp quyền thông báo trong Cài đặt iPhone." }
            let content = UNMutableNotificationContent()
            content.title = "AN Moments"
            content.body = "Hôm nay bạn có khoảnh khắc nào muốn lưu lại không?"
            content.sound = .default
            let trigger = UNCalendarNotificationTrigger(
                dateMatching: DateComponents(hour: 20, minute: 0), repeats: true
            )
            try await center.add(UNNotificationRequest(
                identifier: identifier, content: content, trigger: trigger
            ))
            enabled = true
            UserDefaults.standard.set(true, forKey: "anmoments.daily.reminder")
            return nil
        } catch { return error.localizedDescription }
    }
}
