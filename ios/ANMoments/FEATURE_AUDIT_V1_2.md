# AN Moments 1.2 — canonical feature matrix

This is an original **AN Moments** app, not an altered Locket binary.
An iOS source implementation is NOT an activation of Locket Gold.

## Implemented as source (requires successful Xcode / Supabase tests)

| Feature | Code | Important caveat |
|---|---|---|
| iPhone photo & 60s video | CaptureView, VideoMedia, LocalAlbum | local works without backend after build |
| 2,000-character captions | CaptureView, schema.sql | bound by server validation |
| Text and emoji stickers | PhotoEditorView | images only |
| Photo history and day calendar | MemoriesView, MomentsCalendarView | only first 100 cloud moments loaded |
| Cloud/private image or video sharing | CloudService, schema.sql | create isolated Supabase project |
| Share to chosen friends | CloudService.publishData | explicit recipients |
| Share to entire chosen chat group | GroupMoments, media_extensions.sql | snapshot of group members at send time |
| Chat direct/group | SocialHubView, SocialService | groups up to 20 |
| Private chat image/video attachments | ChatAttachmentService, media_extensions.sql | non-E2EE, signed URLs expire |
| Chat Realtime while open | ChatAttachmentService.observeChat | requires Realtime publication, falls back to 20s polling |
| Profile, friends, custom badge & theme | AppearanceSettings, CloudService | not Locket Gold |
| Invites via contacts/SMS & custom URL | ContactInvitePicker, FriendsView | contact picked manually, never uploaded |
| Viewer list & reactions | CloudService, schema.sql | recipients can see only authorized photos |
| Local 15-photo video recap | RecapExporter, RecapView | saved as original local file |
| Cloud 15-photo recap on iPhone | CloudRecapView | private URLs, device renders |
| User-supplied music overlay | SoundtrackExporter, SoundtrackView | user's own or licensed sound only, no commercial catalog |
| Local streak & one restoration | StreakView | local only |
| Cloud synchronized streak/restoration | CloudStreakView, streak_extensions.sql | UTC days; requires DB setup |
| Personal widget favorite friend | WidgetPreferenceView, WidgetBridge | refresh only while app runs; optional App Groups |
| In-app activity inbox | ActivityInboxView, social_extensions.sql | not remote push |
| Opt-in daily local reminder | LocalReminders | 20:00 device time |
| APNs token registration | RemotePushService, push_extensions.sql | requires paid Apple dev capability + real setup |
| APNs server notification | notify-event Edge Function | deploy + Apple keys + protected webhook required |
| Report/block | PrivacySafetyView, social_extensions.sql | human moderator backend still missing |
| Export metadata JSON | AccountDataService | no media bytes in JSON |
| Delete account on server | delete-account Edge Function | deploy + security/device test required |

## Not implemented or not ready

- **Full Android app parity** — no Android code has been built.
- **Official Locket account and paid Gold access** — not applicable to independent app.
- Apple WidgetKit remote push tokens and background widget push refresh — not implemented.
- Chat end-to-end encryption, group voice/video calls, voice notes — not implemented.
- Licensed hit music / streaming catalog — license/provider contracts required.
- Full downloadable archive of media; current export is metadata JSON only.
- Full moderation dashboard, abuse rate limits, appeal processes.
- True account deletion compliance test across Auth, Storage and backups.
- App Store / TestFlight signing, crash-free physical iPhone QA, accessibility, battery tests.
- Remote push and chat Realtime require new production infrastructure, not automatic by committing code.

## Status

At time of source update: **unverified development branch**.
No successful Xcode compile, Android build, two-device end-to-end test,
live Supabase migration, Apple push registration, or APNs delivery has been
reported. Do not claim parity or production readiness.

## Dependencies and independent verification

- Use \`TEST_ON_MAC.command\` on your Mac to get actual compiler errors.
- Apply SQL in RELEASE_CHECKLIST_V1_2.md order to a separate new Supabase project.
- Run three-user RLS negative tests and full two-device feature QA.
- Do not merge PR #18 until the above checks pass.
