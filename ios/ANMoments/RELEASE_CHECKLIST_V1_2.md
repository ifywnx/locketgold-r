# AN Moments 1.2 — ordered setup & acceptance checklist

## 1. Build without backend
Run in macOS Terminal:

\`\`\`bash
cd ios/ANMoments
zsh TEST_ON_MAC.command
zsh OPEN_XCODE.command
\`\`\`

No Xcode compile results are available from this environment.
Install on iPhone and verify local photo/video, editor, captions, recap, original-audio overlay, history and calendar.

## 2. Create a NEW isolated Supabase project
Do NOT reuse ORBIT, VIRGO or existing business production accounts.
In SQL Editor, apply IN THIS ORDER, each only after checking previous success:

1. \`Backend/schema.sql\`
2. \`Backend/social_extensions.sql\`
3. \`Backend/media_extensions.sql\`
4. \`Backend/streak_extensions.sql\`
5. \`Backend/push_extensions.sql\` (optional)

Supply URL + publishable API key only in \`App/BackendConfig.swift\`.
No secret/service_role key may ever be embedded in an iOS binary.
Configure email OTP template with \`{{ .Token }}\` and test numeric email codes.

## 3. Realtime
Enable *only* \`chat_messages\` in Supabase Realtime publication for
chat live updates. The app filters by room and RLS by authenticated
conversation membership. Test user C (nonmember) cannot receive messages.
There is a foreground polling fallback.

## 4. Account deletion
Use Supabase CLI (follow current \`supabase --help\`):

\`\`\`bash
supabase link --project-ref YOUR_NEW_PROJECT_REF
supabase functions deploy delete-account
\`\`\`

Function code is in \`supabase/functions/delete-account/index.ts\`.
It uses \`@supabase/server\` user auth, verifies caller identity
and uses server-side admin capability to clear their own storage
then delete their Auth account. No client-supplied user id is trusted.
A production data retention/backups and compliance review is still required.

## 5. APNs push, optional only
Requires a paid Apple Developer team with Push Notifications entitlement,
a signing profile configured with \`aps-environment\`, your own APNs
key/team/bundle ID, and Supabase Edge Function secrets. Never commit keys.

Open \`project-with-push.yml\` via \`zsh OPEN_XCODE_PUSH.command\`.
Apply \`Backend/push_extensions.sql\`.
Set server environment values \`APNS_KEY_ID\`, \`APNS_TEAM_ID\`,
\`APNS_PRIVATE_KEY\`, \`APNS_BUNDLE_ID\`, \`APNS_ENVIRONMENT\`.
Deploy \`notify-event\`, preserving its \`verify_jwt=false\` configuration,
while its \`withSupabase({auth:'secret'})\` wrapper enforces a secret apikey.
Set a **trusted** database webhook on INSERT into \`activity_events\`
with secret key in an apikey header.
Do not connect a public / unauthenticated webhook.

APNs test: send a photo from A to B with B's app closed; observe
background notification on B. Test signout/unregister and account switch.
Only then call push implemented in production.

## 6. Widget
Optional App Groups requires \`project-with-widget.yml\` and matching
entitlement on both app and widget extension. Current widget caches
latest photo of a chosen friend only on app refresh. WidgetKit APNs
remote refresh is not implemented. Widget updates are budgeted by iOS.

## 7. Media and security
- Two users A/B friends, C a stranger: C cannot read A's moments, chat
  media, private storage files, activity or streak days
- C cannot call \`publish_moment_group\` for a group they are not in
- C cannot create \`send_chat_media\` for chat they aren't a member of
- A cannot publish media from C's storage directory
- A cannot send after either party blocks them
- A can export private JSON and no other users' protected data
- Token changes after logging out; private widget photo must clear
- Recipient photo/videos appear only after upload+RPC succeeds
- APNs provider returns success only if configured and valid token
- App media, download, render and video recap tested with large images
- Server delete removes owned photos, chat media, profile and Auth user
  and does not delete unrelated users' messages from a group

## 8. Remaining work before release
- E2EE, cloud media archive export, Android, mass notification retries,
  abuse moderation, secure rate limits, legal/licensing review,
  real WidgetKit remote APNs, TestFlight and Apple privacy declarations.

No services are deployed automatically by committing these files to GitHub.
