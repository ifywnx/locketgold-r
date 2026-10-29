# AN Moments — Gold-like capabilities

**This is an independently written SwiftUI app.** It neither enables nor impersonates Locket Gold on the official Locket service. No Telegram login, license bypass, original Locket binary, or proprietary private API is included.

Reference for official Gold feature inventory (published May 5, 2026):
https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included

| Feature analogous to Locket Gold | AN Moments code location | Status |
| --- | --- | --- |
| Custom app icons | scripts/generate_icons.swift, project.yml, SettingsView.swift | Source added; iPhone build required |
| Photos from Camera Roll | CaptureView.swift | Source added; local first, optional cloud |
| Unlimited friends | FriendsView.swift, Backend/schema.sql | No app-level hard cap; backend capacity/performance not validated |
| Longer videos | VideoMedia.swift, CaptureView.swift, CloudService.swift | 60-second record/import, 100 MB maximum; device + server test required |
| Streak restoration | StreakEngine.swift, StreakView.swift | Local prototype, 1 complimentary restoration; does not sync across devices |
| No ads | Entire AN Moments source | No ad SDK integrated |
| Custom profile badge | AppearanceSettings.swift, SettingsView.swift, profiles.badge_style | Source added, not an official Locket Gold verification badge |
| Camera themes | AppearanceSettings.swift, CaptureView.swift | 6 locally selectable themes |
| Longer captions | CaptureView.swift, Backend/schema.sql | 2,000-character limit in UI/DB |
| Who viewed a post | CloudService.swift, moment_views RLS + FeedView.swift | Only explicit recipients; receipts recorded when opened in feed; server must be configured |
| Colored widget borders | WidgetBridge.swift, Widget/ANMomentsWidget.swift | Optional WidgetKit extension; requires App Groups |
| Custom username | CloudService.swift, SettingsView.swift | Cloud only; unique 3–24-character handle |

## Crucial differences / incomplete work

- This does **NOT** alter or unlock the existing Locket application, account, or paid subscription.
- Realtime background updates, WidgetKit push notifications, video recap, native chat/group chat, account deletion and moderation are not implemented.
- The widget prototype is intentionally optional because it requires signing with App Groups. The main app runs without it.
- There is no independently verified Xcode build, iPhone camera test, video codec test, or two-account Supabase E2E test yet.
- Recording on a device is limited to 60 seconds; imported movies longer than 60 seconds are rejected rather than silently trimmed.
- The streak restoration is a local visual/logic feature only, not a server-issued restoration.
- Photo/video sharing between devices requires a new Supabase project, the migration in Backend/schema.sql, working email OTP, and testing RLS with two identities.

## Build with icons

After cloning branch feature/an-moments-ios on a Mac with Xcode:

    cd ios/ANMoments
    zsh OPEN_XCODE.command

This script installs XcodeGen if needed, generates 1024px custom icons locally, writes the Xcode project, and opens Xcode. Select your Apple Personal Team, choose your physical iPhone, then press Command+R.

The source package does not contain copyrighted Locket icons. Mac-generated icons use original solid-color heart graphics.

## Testing priorities

1. Run \`zsh TEST_ON_MAC.command\` for an unsigned iOS target build. It may reveal compile problems; none have been independently verified here.
2. Run app on an iPhone: photo, imported photo, 60-second video and audio recording, media playback, icon switching.
3. Test camera themes, badge states, local streak summary and single restoration credit.
4. Configure a NEW Supabase project with the supplied schema, test OTP, two-user invitations, image and video sharing, viewer receipts and storage RLS.
5. Enable optional WidgetKit extension only after confirming App Groups signing; test borders and photo refresh on a real device.
6. Conduct independent security/privacy QA before inviting non-test users.

References:
- Apple alternate icons: https://developer.apple.com/documentation/xcode/configuring-your-app-to-use-alternate-app-icons
- WidgetKit refresh: https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date
- Supabase upload: https://supabase.com/docs/reference/swift/storage-from-upload
