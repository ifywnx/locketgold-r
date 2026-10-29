import SwiftUI
import UIKit

@MainActor
final class AppearanceSettings: ObservableObject {
    enum CameraTheme: String, CaseIterable, Identifiable {
        case gold, rose, lavender, ocean, forest, night
        var id: String { rawValue }
        var name: String {
            switch self {
            case .gold: "Sunshine"
            case .rose: "Pink Love"
            case .lavender: "Violet"
            case .ocean: "Ocean"
            case .forest: "Matcha"
            case .night: "Midnight"
            }
        }
        var accent: Color {
            switch self {
            case .gold: Color(red: 1, green: 0.78, blue: 0.25)
            case .rose: Color(red: 0.97, green: 0.52, blue: 0.62)
            case .lavender: Color(red: 0.64, green: 0.57, blue: 0.95)
            case .ocean: Color(red: 0.30, green: 0.70, blue: 0.85)
            case .forest: Color(red: 0.38, green: 0.72, blue: 0.56)
            case .night: Color(red: 0.50, green: 0.54, blue: 0.70)
            }
        }
        var background: Color {
            switch self {
            case .gold: Color(red: 0.99, green: 0.98, blue: 0.96)
            case .rose: Color(red: 1.00, green: 0.97, blue: 0.97)
            case .lavender: Color(red: 0.98, green: 0.97, blue: 1.00)
            case .ocean: Color(red: 0.96, green: 0.99, blue: 1.00)
            case .forest: Color(red: 0.97, green: 0.99, blue: 0.96)
            case .night: Color(red: 0.95, green: 0.96, blue: 0.99)
            }
        }
    }

    enum BadgeStyle: String, CaseIterable, Identifiable {
        case heart, star, crown, flower, none
        var id: String { rawValue }
        var label: String {
            switch self {
            case .heart: "Trái tim"
            case .star: "Ngôi sao"
            case .crown: "Vương miện"
            case .flower: "Hoa"
            case .none: "Không có"
            }
        }
        var symbol: String {
            switch self {
            case .heart: "heart.fill"
            case .star: "star.fill"
            case .crown: "crown.fill"
            case .flower: "camera.macro"
            case .none: ""
            }
        }
    }

    @Published var cameraTheme: CameraTheme {
        didSet { UserDefaults.standard.set(cameraTheme.rawValue, forKey: "anmoments.theme") }
    }
    @Published var badgeStyle: BadgeStyle {
        didSet { UserDefaults.standard.set(badgeStyle.rawValue, forKey: "anmoments.badge") }
    }

    init() {
        cameraTheme = CameraTheme(
            rawValue: UserDefaults.standard.string(forKey: "anmoments.theme") ?? ""
        ) ?? .gold
        badgeStyle = BadgeStyle(
            rawValue: UserDefaults.standard.string(forKey: "anmoments.badge") ?? ""
        ) ?? .heart
    }

    func setIcon(_ name: String?, completion: @escaping (String?) -> Void) {
        guard UIApplication.shared.supportsAlternateIcons else {
            completion("iPhone hoặc bản build này không hỗ trợ đổi icon.")
            return
        }
        UIApplication.shared.setAlternateIconName(name) { error in
            DispatchQueue.main.async { completion(error?.localizedDescription) }
        }
    }
}
