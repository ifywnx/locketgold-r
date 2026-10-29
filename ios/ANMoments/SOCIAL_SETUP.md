# AN Moments 1.1 — Social backend setup

This is an **independent app**, not Locket or a Locket Gold entitlement unlock.

## Stage A — offline mode, no backend
1. On Mac run \`cd ios/ANMoments && zsh OPEN_XCODE.command\`.
2. Xcode > Signing & Capabilities > select Personal Team.
3. Connect unlocked iPhone and press Command+R.
4. Verify photo/video capture, stickers/text, history, calendar, 15-photo recap, 6 camera themes, icons, local daily reminder.
5. Chat, real friend sync and cloud notifications intentionally show “requires Supabase” when the backend is not configured.

## Stage B — NEW isolated Supabase project
Do NOT reuse ORBIT, VIRGO or existing production project.

1. Create a new Supabase project in your own organization.
2. In SQL Editor run **Backend/schema.sql** completely and check success.
3. Then run **Backend/social_extensions.sql** completely and check success.
4. Project Settings > Data API: verify the public schema and the authenticated role table grants are exposed correctly. Explicit grants are included in SQL, but API exposure settings differ by project.
5. Authentication > Providers > Email: enable email OTP. Configure the email template to include \`{{ .Token }}\` so the app's numeric code entry matches the email.
6. From Project settings get Project URL and **publishable** public client key.
7. Paste ONLY those two values into \`App/BackendConfig.swift\`. NEVER use \`service_role\` / secret keys in client code.
8. Build two iPhones with two independent email accounts. Account handles are not emails. A sends friend request to B by exact handle, B accepts.
9. Post photo/video to B; B refreshes and can see it. A sees the view receipt only after B opens the post.
10. In **Kết nối** open chat; start a direct chat or group from existing friends. Messages poll every 6 seconds only while conversation is open. They are **not** end-to-end encrypted.
11. Open in-app alerts from Chat > bell icon. This is a stored activity inbox, not APNs background push.
12. Settings > An toàn: blocking is server enforced on future invitations and chat sends; old content and prior chat records can remain.
13. The “delete account” button **queues a request**; it DOES NOT delete auth user, private media or DB records. A privileged server cleanup workflow is required.

## Schema safety
- All tables have Row Level Security enabled; no untrusted client can directly create conversations, memberships or chat messages.
- Two privileged conversation RPCs authenticate via auth.uid(), require friendship for group membership, and deny blocked contacts.
- Chat read is membership scoped; messages can only be sent through checked RPC.
- Profiles are visible only to self, friends, and pending incoming requester; exact-handle invitation is performed inside a checked RPC.
- Reports are insert-only with status pending; no client may mark them reviewed.
- Activity inbox can be read only by its recipient.
- Storage bucket is PRIVATE and media downloads use short-lived signed URLs.
- **SQL has not been applied to a live project in this update.** Validate on isolated test project and run Supabase Security Advisor + RLS negative tests before inviting real users.

## Remaining production tasks
- APNs push notification server, widget push tokens and background delivery
- True Supabase Realtime/Broadcast authorization (current chat polls only while open)
- Server worker for account deletion, stored media cleanup and retention
- Moderation review dashboard, human review and abuse/rate limiting
- Remove old data from blocked users' historical access when appropriate
- Real two-device E2E / load testing and Apple Store privacy compliance
- End-to-end encryption, call features, media in chat and Apple Music/Spotify licensing are NOT implemented

## Useful docs
- Locket Gold: https://help.locket.com/en/articles/11057185-what-is-locket-gold-and-what-features-are-included
- Locket core interactions: https://help.locket.com/en/articles/14188147-how-is-locket-different-from-other-social-media
- Supabase current Swift SDK: https://github.com/supabase/supabase-swift
- Data API securing: https://supabase.com/docs/guides/api/securing-your-api
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Apple notifications: https://developer.apple.com/documentation/usernotifications
