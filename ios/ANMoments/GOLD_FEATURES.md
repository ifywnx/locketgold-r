# AN Moments — Gold-equivalent feature inventory

**AN Moments is an independently written SwiftUI app.** It does not enable or impersonate Locket Gold on the official Locket service. It does not patch the Locket IPA, log into Locket, call Locket private APIs, or bypass a paid entitlement.

Public reference: https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included

## Feature matrix

| Capability inspired by public Locket Gold benefits | AN Moments source | Current status |
|---|---|---|
| Custom app icons | `scripts/generate_icons.swift`, `project.yml`, `SettingsView.swift` | Three original icons; requires build and device signing |
| Camera Roll upload | `CaptureView.swift`, `VideoMedia.swift` | Photos and videos can be selected; device QA required |
| Unlimited friends | `FriendsView.swift`, `Backend/schema.sql` | No 20-friend cap is declared in current app/schema; backend capacity and performance not validated |
| Longer videos | `VideoMedia.swift`, `CaptureView.swift`, `CloudService.swift` | Current cap is 60 seconds and 100 MB; extended duration remains a gap |
| Streak restoration | `StreakView.swift`, `CloudStreakView.swift`, `streak_extensions.sql` | Local and cloud source paths exist; cloud mode needs migration, RLS, and cross-device QA |
| No ads | App source and dependency manifest | No ad SDK is included in current source; recheck release dependency output |
| Custom profile badge | `AppearanceSettings.swift`, `SettingsView.swift`, `profiles.badge_style` | Heart/star/crown/flower/none styles; not an official Locket badge |
| Camera themes | `AppearanceSettings.swift`, `CaptureView.swift` | Six local themes |
| Captions and stickers | `CaptureView.swift`, `PhotoEditorView.swift` | 2,000-character caption limit; text/emoji stickers on images |
| Viewer list and reactions | `CloudService.swift`, `moment_views`, `FeedView.swift` | Source exists; requires isolated Supabase and two-account QA |
| Best-friend widget | `WidgetPreferenceView.swift`, `WidgetBridge.swift`, `Widget/ANMomentsWidget.swift` | One app-level favorite sender; WidgetKit target is optional and requires App Groups |
| Photo history | `CloudService.loadMoreMoments()`, `FeedView.swift`, `MemoriesView.swift` | Source now loads 100 authorized records per page; verify with more than 100 records |
| Video recap | `RecapExporter.swift`, `CloudRecapView.swift` | Manual recap from up to 15 photos; automatic monthly recap is not implemented |
| Chat and group chat | `SocialHubView.swift`, `SocialService.swift` | Source exists; two-device Realtime QA required |
| Private chat media | `ChatAttachmentService.swift`, `media_extensions.sql` | Image/video attachments; not end-to-end encrypted |

## Gaps before a comparable release

- Extended video duration and upload flow with server-side validation, upload progress, cancellation, and storage quotas.
- Per-widget friend selection for multiple Best Friend/Crush-style widgets.
- Tested background/remote widget refresh and push delivery.
- Automatic monthly recap generation.
- Chat reactions and voice notes.
- End-to-end encryption, complete media archive export, production moderation, abuse rate limits, and Android.
- Successful Xcode builds, physical-device QA, dedicated Supabase deployment, RLS negative tests, TestFlight signing, and privacy review.

## Build and test

From `ios/ANMoments` on a Mac with Xcode:

```bash
zsh TEST_ON_MAC.command
zsh TEST_WITH_WIDGET.command
zsh OPEN_XCODE_WITH_WIDGET.command
```

The widget-enabled build is an unsigned compile. Installing the widget requires matching App Groups entitlements and a signing profile supported by the selected Apple Developer Team. APNs delivery additionally requires server credentials and deployment.

## Product boundary

AN Moments can provide its own features without a Locket Gold subscription. Those are AN Moments features, not Locket Gold entitlements; they do not grant access to Locket's servers, accounts, or paid content.
