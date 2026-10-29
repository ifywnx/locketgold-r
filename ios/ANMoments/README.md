# AN Moments — iPhone Native App

Independent SwiftUI photo-moment app. **Not** an extracted Locket binary, Gold bypass, or Telegram-gated mod.

Read **FEATURE_AUDIT_V1_1.md** for the authoritative feature matrix, and **SOCIAL_SETUP.md** for separate backend setup. **No Mac/iPhone build has been verified.**

## What is already implemented

- Native iOS photo/video capture and Photos picker; original video recording/import up to 60 seconds
- Original photo text/sticker editor; local calendar, 15-photo offline video recap
- Local-only gallery, history, emoji reactions, photo/video sharing through iOS Share Sheet
- Manual local friend labels (local mode only, NOT genuine remote friendships)
- Email OTP via Supabase when configured
- Real friendship invitations/acceptance, unfriend and custom username through SQL RPC
- Private Supabase Storage image upload, database-backed moments, recipient visibility enforced with RLS
- Manual refresh of shared photos/videos, cloud emoji reactions, viewed-by receipts, unfriend, delete your own cloud moments
- Custom camera themes, custom badges, generated alternate icons, local streak restoration
- Direct/group text chat, stored activity inbox and opt-in daily local reminder
- Account blocking, reporting and pending-account-deletion request via optional social backend
- Optional WidgetKit/App Groups reference code with colored borders

## Important limitations (do not mistake these for implemented features)

- Chat polls while visible (every 6 seconds); no background APNs/WidgetKit push implemented
- Local friend labels never deliver images to another iPhone
- Widget requires Apple App Groups capability, device build and testing; excluded from the default project
- Local-only recap and text chat source exist, but there is **no official Locket Gold subscription integration**
- Account deletion is a **request queue** rather than a completed server-side erasure
- Chat has no E2EE, APNs background push, media attachments or guaranteed real-time delivery
- No professional security audit, no verified Xcode device build in this environment
- A new Supabase project, schema, and publishable key are required for real sharing
- No copyrighted Locket assets, proprietary code, or hidden API endpoints have been copied

## Build on Mac

Requirements: Xcode 26+, macOS with Xcode Command Line Tools, Homebrew.

In Terminal:

    cd ios/ANMoments
    zsh OPEN_XCODE.command

In Xcode:
1. Select target **ANMoments** > Signing & Capabilities.
2. Choose your Apple **Personal Team**.
3. Use a unique Bundle Identifier if it is already taken.
4. Select your connected iPhone and press Run (Command+R).
5. When BackendConfig.swift still contains placeholders, app runs in clearly marked LOCAL mode.

If XcodeGen complains about the external Supabase package, use File > Packages > Reset Package Caches.

## Enable real multi-device photo sharing

1. Create a **separate** Supabase project (do not reuse ORBIT production credentials).
2. Run Backend/schema.sql, then Backend/social_extensions.sql in the SQL Editor. Read SOCIAL_SETUP.md.
3. In Authentication > Email Templates > Magic Link, include \`{{ .Token }}\` to deliver an OTP code, or configure matching OTP settings.
4. Open App/BackendConfig.swift; paste the **Project URL** and **publishable/anon** key. NEVER paste service_role/secret keys.
5. Rebuild and install on two iPhones using two different email accounts.
6. On each phone, copy your handle from the Friends tab. Send a request to the other handle, accept it, then choose the friend when posting.
7. Pull to refresh in the recipient's feed. The app currently uses manual refresh, not push.

## Widget

Widget reference code is in Widget/. Apple officially recommends a WidgetKit extension and App Groups for sharing content. The base project intentionally excludes it, so free Personal Team device signing is simpler. See WIDGET_SETUP.md. Widgets may require capabilities unavailable on a free account.

## Security

- Cloud bucket is private with RLS scoped to author or explicit recipient.
- Local images are stored in Application Support, not uploaded by local mode.
- Never enter Telegram credentials or personal Locket credentials into a modded IPA.
- Test two-user isolation (Alice can't read Bob's moments without a recipient edge) before production.
- No claim of independent App Store production readiness.

## File map

- App/ANMomentsApp.swift: root navigation, visual theme
- App/BackendConfig.swift: opt-in cloud configuration
- App/CloudService.swift: auth, friends, cloud moments, storage, database
- App/SocialService.swift & App/SocialHubView.swift: direct/group text chat
- App/PrivacySafetyView.swift, ActivityInboxView.swift: safety and in-app inbox
- App/PhotoEditorView.swift & RecapExporter.swift: text/stickers and local video recap
- App/MomentsCalendarView.swift: calendar history
- App/LocalAlbum.swift: local image and JSON persistence
- App/CaptureView.swift & App/CameraPicker.swift: camera, library, recipients
- App/FeedView.swift: photo feed and local reactions
- App/FriendsView.swift: invites or local labels
- App/MemoriesView.swift: grid and share
- App/SettingsView.swift: settings and data controls
- Backend/schema.sql: tables, RLS, private bucket, invitation functions
- Backend/social_extensions.sql: private conversations, moderation queues, blocking and events
- Widget/: optional WidgetKit demo

## References

- Locket product features: https://locket.com/get
- Apple WidgetKit: https://developer.apple.com/documentation/widgetkit/
- Supabase Swift: https://github.com/supabase/supabase-swift
- Supabase OTP: https://supabase.com/docs/reference/swift/auth-signinwithotp
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- XcodeGen: https://github.com/yonaskolb/XcodeGen
- Inspiration only: https://github.com/rish106-hub/Lovlet
