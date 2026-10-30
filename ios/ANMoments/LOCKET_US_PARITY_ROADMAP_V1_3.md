# AN Moments — Locket US feature-parity roadmap

## Product boundary

AN Moments is an independent iOS social-photo app with its own identity, accounts, backend, storage, and entitlement model. It does not modify the Locket app, access Locket accounts, call Locket private APIs, or activate Locket Gold.

The target is comparable user-facing functionality in the same product category, not copied branding, assets, or proprietary implementation.

## Public reference snapshot

The feature target is based on public Locket materials:

- Locket Gold benefits: https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included
- US App Store listing: https://apps.apple.com/us/app/locket-widget/id1600525061
- Friend limit: https://help.locket.com/en/articles/7915024-how-many-friends-can-i-have-on-locket
- WidgetKit update guidance: https://developer.apple.com/documentation/widgetkit/updating-widgets-with-widgetkit-push-notifications

Publicly described Locket Gold benefits include custom app icons, Camera Roll upload, unlimited friends, longer videos, streak restoration, no ads, a custom badge, and camera themes. The public app listing describes close-friend photo sharing, Home Screen widgets, reactions, photo history, video recaps, and separate widgets for a best friend or crush.

## Current source status (AN Moments 1.2 + parity work)

"Source exists" does not mean it has passed a device or production test.

| Capability | Current source status | Release status |
|---|---|---|
| Capture photos and import from Photos | Implemented | Needs device QA |
| Capture/import videos | Implemented, currently capped at 60 seconds and 100 MB | Needs extended-duration design and QA |
| Captions and photo stickers | Implemented | Needs device QA |
| Private sharing to selected friends | Implemented with Supabase schema/RPC | Needs isolated backend and RLS tests |
| Reactions to moments | Implemented | Needs two-account QA |
| Photo history and calendar | Implemented; source now pages through 100 authorized moments at a time | Verify with more than 100 records |
| Manual video recap | Implemented for up to 15 photos | Monthly automatic recap not implemented |
| Camera themes and profile badges | Implemented | Needs device QA |
| Alternate app icons | Three icon variants generated | Needs signing/device QA |
| Friend limit | No 20-friend cap is declared in the current SQL schema | Verify server behavior before claiming unlimited |
| Streak restoration | Local restoration exists; cloud streak support is separate | Needs unified, server-authoritative testing |
| Chat and group chat | Implemented in source | Realtime works only while chat is open; needs two-device QA |
| Chat media attachments | Implemented in source | Not end-to-end encrypted |
| Home Screen widget | Optional WidgetKit target exists; a dedicated unsigned build/open script was added | Compile and install with App Groups |
| Best-friend/crush widget selection | One app-level favorite sender is stored | Per-widget configuration required |
| Background widget refresh | Not implemented as a verified production path | APNs/WidgetKit work required |
| Remote notifications | Token registration and server function source exist | Apple credentials, deployment, and delivery tests missing |
| No advertising | No ad SDK is included in the current app source | Recheck dependency/build output before release |
| Android | No Android app | Not implemented |
| End-to-end encryption | Not implemented | Security architecture required |
| Moderation and abuse controls | Basic report/block source exists | Production moderation, rate limits, and appeals missing |
| Full account/media export and deletion | Metadata export and deletion function source exist | Compliance and backup-retention tests missing |

## Delivery priorities

### P0 — Make the existing iOS app verifiable

1. Build the app and WidgetKit extension with Xcode on macOS; CI is configured to attempt both unsigned builds.
2. Fix compiler errors before adding more surface area.
3. Install on two iPhones and verify sign-in, friend requests, photo/video sharing, reactions, chat, media attachments, history, and account switching.
4. Apply migrations to a new dedicated Supabase project; never reuse ORBIT/VIRGO production data.
5. Run negative RLS tests with an unrelated third account.
6. Verify history pagination with more than 100 moments, refreshes, and concurrent new posts; verify large media handling.

### P1 — Close the visible feature gaps

1. Add per-widget friend selection so multiple widgets can show different friends.
2. Implement a tested background/remote widget refresh path compatible with the supported iOS versions; respect WidgetKit's delivery budget.
3. Extend video duration and upload limits with server-side validation, upload progress, cancellation, and storage quotas.
4. Make streak restoration authoritative and synchronized across devices.
5. Add automatic monthly recap generation from the user's own authorized media.
6. Complete chat reactions and voice messages only after attachment, moderation, and privacy tests pass.

### P2 — Production-grade capabilities

1. Design and test end-to-end encryption before claiming private chat is E2EE.
2. Add a complete media archive export and verified account-erasure workflow.
3. Build moderation tooling, abuse reporting, rate limits, and operational audit logs.
4. Plan Android only after the iOS feature and backend contracts stabilize.
5. Complete TestFlight/App Store signing, accessibility, performance, battery, and privacy reviews.

## Acceptance gates

Do not label the app "complete" until all of the following are true:

- Xcode build succeeds for app and widget targets.
- Two-device end-to-end tests pass.
- RLS negative tests pass for non-friends and non-members.
- Upload, download, deletion, and account switching do not leak another user's media.
- Push delivery and widget refresh are verified on physical devices.
- Backend migrations and Edge Functions are deployed to the dedicated AN Moments project.
- Signing, privacy declarations, data deletion, and support flows are reviewed.

## Important distinction

AN Moments may offer its own unrestricted feature set without a Locket Gold subscription. Those are AN Moments features, not Locket Gold entitlements, and they do not grant access to Locket's servers or paid content.
