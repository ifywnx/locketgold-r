# AN Moments — Feature audit v1.1

## Done in source, not yet compiled / tested on device

- Native SwiftUI navigation and local-only mode
- Capture photo/video, import media; video <=60 seconds and <=100MB
- Photo editor overlays text and emoji stickers before saving
- Camera theme selection, name/badge, alternate app icon generator
- Local friends labels, local persistence and emoji reactions
- Gallery, date-based calendar, offline 15-image video recap (2s/image, no music)
- Supabase OTP login and authenticated private friend requests
- Cloud private photos/videos, explicit recipients, view receipts
- Direct text chat and up to 20 participants in a group
- In-app event inbox; foreground chat refresh via polling (6s)
- Blocking, user reporting, account deletion **request queue**
- Daily local iPhone reminder at 20:00, opt-in
- Optional WidgetKit prototype with colored borders (requires App Groups signing)

## Absent or not yet operational

- **Official Locket Gold subscription access**: intentionally never part of independent app
- APNs push/background widget delivery, server-to-device push
- Native realtime subscriptions with Realtime authorization; current chat foreground polling only
- E2EE and media attachments to chat
- Automatically updated friend-specific widgets when recipient's app is closed
- Contact book invites with consent, deep links and group post send as a group
- Apple Music/Spotify integration and rights-cleared music catalog
- Cloud video recap and cloud streak sync; recap only uses local photos, restores use local credits
- Actual account deletion, data export + erasure worker; only a pending request queue exists
- Automated/ human abuse moderation, spam controls and incident handling
- Payment, subscriptions, App Store release, accessibility and battery benchmarking
- Finished UI/UX validation and visual QA; there has been no device build

## Acceptance criteria before telling anyone app is production-ready

1. XcodeGen generates project and Xcode build succeeds on Mac.
2. Local photo, video, editor, recap and calendar tests pass on iPhone.
3. Schema and social extensions apply successfully to NEW Supabase project.
4. A/B/C RLS tests prove nonparticipant cannot read/send chats or access private media.
5. Users can opt in/out of local reminders; notification prompt is shown only when asked.
6. Widget signing works and data refreshes on actual iPhone.
7. Reporting and deletion backend operators are implemented and monitored.
8. Crash-free two-device beta, privacy policy and moderation workflow are completed.

**Current status: source implementation / unverified beta candidate.**
