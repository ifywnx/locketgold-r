import Foundation

// Public project URL and publishable/anon key ONLY.
// Never use the service_role/secret key in an iOS app.
enum BackendConfig {
    static let urlString = "YOUR_SUPABASE_URL"
    static let publishableKey = "YOUR_SUPABASE_PUBLISHABLE_KEY"

    static var isConfigured: Bool {
        guard let url = URL(string: urlString), url.scheme == "https", url.host != nil else { return false }
        return !publishableKey.isEmpty && !publishableKey.hasPrefix("YOUR_")
    }
}
