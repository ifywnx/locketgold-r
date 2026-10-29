import SwiftUI

@main
struct ANMomentsApp: App {
    @StateObject private var album = LocalAlbum()
    @StateObject private var cloud = CloudService()
    @StateObject private var appearance = AppearanceSettings()
    @StateObject private var social = SocialService()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(album)
                .environmentObject(cloud)
                .environmentObject(appearance)
                .environmentObject(social)
                .tint(Theme.ink)
        }
    }
}

enum Theme {
    static let cream = Color(red: 0.99, green: 0.98, blue: 0.96)
    static let gold = Color(red: 1.00, green: 0.78, blue: 0.25)
    static let ink = Color(red: 0.15, green: 0.16, blue: 0.18)
    static let muted = Color(red: 0.50, green: 0.50, blue: 0.53)
}

struct RootView: View {
    @EnvironmentObject private var social: SocialService
    @EnvironmentObject private var cloud: CloudService

    var body: some View {
        Group {
            if cloud.enabled && cloud.userID == nil {
                EmailLoginView()
            } else {
                MainTabs()
            }
        }
        .task {
            await cloud.restoreSession()
        }
        .onChange(of: cloud.userID) { _, _ in
            // Never display the previous account's chat/inbox on a shared iPhone.
            social.clearSensitiveCache()
        }
    }
}

struct MainTabs: View {
    @State private var tab = 0

    var body: some View {
        TabView(selection: $tab) {
            FeedView()
                .tabItem { Label("Khoảnh khắc", systemImage: "heart.square.fill") }
                .tag(0)
            CaptureView()
                .tabItem { Label("Chụp ảnh", systemImage: "camera.fill") }
                .tag(1)
            SocialHubView()
                .tabItem { Label("Kết nối", systemImage: "bubble.left.and.bubble.right.fill") }
                .tag(2)
            MemoriesView()
                .tabItem { Label("Kỷ niệm", systemImage: "square.grid.2x2.fill") }
                .tag(3)
            SettingsView()
                .tabItem { Label("Cá nhân", systemImage: "person.crop.circle") }
                .tag(4)
        }
        .background(Theme.cream)
    }
}
