import SwiftUI
import UIKit
import UserNotifications
import Supabase

extension Notification.Name {
    static let anMomentsAPNsToken = Notification.Name("ANMoments.APNsToken")
}

final class ANMomentsPushDelegate: NSObject, UIApplicationDelegate,
                                   UNUserNotificationCenterDelegate {
    func application(_ app: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
        let hex = token.map { String(format: "%02x", $0) }.joined()
        UserDefaults.standard.set(hex, forKey: "anmoments.apnsToken")
        NotificationCenter.default.post(name: .anMomentsAPNsToken, object: hex)
    }

    func application(_ app: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        UserDefaults.standard.set(
            error.localizedDescription, forKey: "anmoments.apnsLastError"
        )
    }
}

@MainActor
final class RemotePushService: ObservableObject {
    @Published private(set) var enabled = UserDefaults.standard.bool(
        forKey: "anmoments.apnsEnabled"
    )
    @Published var feedback: String?

    func enable(cloud: CloudService) async {
        guard cloud.userID != nil else {
            feedback = "Cần đăng nhập Supabase để nhận thông báo từ máy chủ."
            return
        }
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            guard granted else {
                feedback = "Bạn chưa cấp quyền thông báo."
                return
            }
            enabled = true
            UserDefaults.standard.set(true, forKey: "anmoments.apnsEnabled")
            UIApplication.shared.registerForRemoteNotifications()
            await uploadCachedToken(cloud: cloud)
        } catch {
            feedback = error.localizedDescription
        }
    }

    func uploadCachedToken(cloud: CloudService) async {
        guard enabled, let api = cloud.sharedClient, cloud.userID != nil,
              let token = UserDefaults.standard.string(forKey: "anmoments.apnsToken")
        else { return }
        do {
            try await api.rpc("register_push_token", params: [
                "p_token": token
            ]).execute()
            feedback = "Token thiết bị đã đăng ký. Cần cấu hình APNs server để nhận push thật."
        } catch {
            feedback = "Không thể đăng ký token: \(error.localizedDescription)"
        }
    }

    func disable(cloud: CloudService) async {
        if let api = cloud.sharedClient,
           let token = UserDefaults.standard.string(forKey: "anmoments.apnsToken") {
            do {
                try await api.from("device_push_tokens")
                    .delete().eq("token", value: token).execute()
            } catch {
                feedback = error.localizedDescription
                return
            }
        }
        enabled = false
        UserDefaults.standard.set(false, forKey: "anmoments.apnsEnabled")
        UIApplication.shared.unregisterForRemoteNotifications()
    }
}
