# QA checklist: AN Moments 1.1

Status: Source created. No completed Mac/Xcode build, iPhone run, Supabase migration, or two-device E2E test has been reported.

## 1. Build
- [ ] Run OPEN_XCODE.command from macOS and resolve package dependencies
- [ ] Run TEST_ON_MAC.command; check full compiler diagnostics, not only generation
- [ ] Validate photo text/sticker editor and exported composite JPEG
- [ ] Export 15-photo offline recap and verify actual video codec/playback
- [ ] Calendar by-date filter shows only matching local/cloud images
- [ ] Choose Personal Team; build directly on iPhone with Command+R
- [ ] Test iPhone permissions for Camera and Photos picker
- [ ] Test OS 26 system appearance and dynamic text sizes
- [ ] Verify 3 app icons generated and switch without errors
- [ ] Test six camera themes, badge selection and app re-launch
- [ ] Record 1–60 second movie with microphone and replay
- [ ] Import .mov/.mp4 with correct permission, reject >60 seconds and >100 MB
- [ ] Verify 2,000-character caption boundaries (local and cloud)
- [ ] Test local streak, previous-day boundary and single restoration credit

## 2. Local-only mode (no Supabase configuration)
- [ ] Launch without email or Telegram prompt
- [ ] Take a photo and save it; verify feed and Memories show the same image
- [ ] Import a photo from Photos; verify correct orientation
- [ ] Add friend label; confirm that UI does NOT falsely claim it was delivered
- [ ] Leave and reopen the app; verify local data persistence
- [ ] Add/change reaction; share/export image via system sheet
- [ ] Delete moment; verify image file disappears
- [ ] Clear data; verify history and local friends are empty
- [ ] Verify that airplane mode still permits local save/history

## 3. Cloud setup
- [ ] Use a NEW Supabase project and run Backend/schema.sql then Backend/social_extensions.sql
- [ ] Verify private bucket "moments"; it must NOT be public
- [ ] Confirm OTP email contains a numeric code, not only magic link
- [ ] Create two distinct accounts, A and B
- [ ] Check each automatically has a unique profile handle
- [ ] A sends friend request; B sees it; B accepts
- [ ] A posts to B; B can see after refresh and A can delete
- [ ] B reacts; verify reaction is saved and remains after refresh
- [ ] A shares video to B, B plays it and confirms audio
- [ ] B opens A moment, A sees B in its viewer list
- [ ] Confirm cloud badge is visible to friends
- [ ] Remove friendship; verify new posts cannot be sent to removed friend
- [ ] A starts direct chat with B; both can exchange messages after foreground refresh
- [ ] Create group with A/B/C; ensure outsider D cannot read or send to group
- [ ] New messages generate in-app activity events for other members
- [ ] Daily reminder at 20:00 can be opted in/out and does not request permission at app launch

## 4. Mandatory security negative tests
- [ ] Nonfriend C cannot select/download A's image, even knowing the storage path
- [ ] C cannot add a recipient row for an image owned by A
- [ ] C cannot create a friend request on behalf of A
- [ ] C cannot accept a friend request addressed to B
- [ ] A cannot upload into C's storage folder
- [ ] Confirm only publishable/anon key is in iOS source, never service_role
- [ ] Verify account deletion/privacy export before any public beta
- [ ] Verify server-side user reporting, blocking and abuse controls before release
- [ ] C cannot enumerate all profiles by querying the profiles table
- [ ] A cannot create or read a conversation without a membership edge
- [ ] A cannot add B to a group without friendship consent
- [ ] A cannot send a chat message after either participant blocks the other
- [ ] User cannot write report.status=reviewed or deletion_request.status=completed
- [ ] Account deletion is only queued; verify a separately secured cleanup worker before production

## 5. Optional widget
- [ ] Enable App Groups on BOTH app/widget signing profiles
- [ ] Generate from project-with-widget.yml
- [ ] Install app and widget on real iPhone
- [ ] Add home screen widget and save new moment in app
- [ ] Confirm image refreshes on Home Screen
- [ ] Confirm App Groups entitlement works with actual Apple Developer team
- [ ] Change camera theme and verify widget border changes

## Not part of this build
- APNs push and background live delivery; current chat polls only while open
- Real account erasure, server moderation and production abuse controls
- Cloud music catalog / social discovery / E2EE chat
- Full parity with Locket or Locket Gold
- Runtime bypass of any Telegram/modded IPA login
