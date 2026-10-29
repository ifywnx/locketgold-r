# QA checklist: AN Moments 1.0

Status: Source created. No completed Mac/Xcode build, iPhone run, Supabase migration, or two-device E2E test has been reported.

## 1. Build
- [ ] Run OPEN_XCODE.command from macOS and resolve package dependencies
- [ ] Run TEST_ON_MAC.command; check full compiler diagnostics, not only generation
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
- [ ] Use a NEW Supabase project and run Backend/schema.sql once
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

## 4. Mandatory security negative tests
- [ ] Nonfriend C cannot select/download A's image, even knowing the storage path
- [ ] C cannot add a recipient row for an image owned by A
- [ ] C cannot create a friend request on behalf of A
- [ ] C cannot accept a friend request addressed to B
- [ ] A cannot upload into C's storage folder
- [ ] Confirm only publishable/anon key is in iOS source, never service_role
- [ ] Verify account deletion/privacy export before any public beta
- [ ] Verify server-side user reporting, blocking and abuse controls before release

## 5. Optional widget
- [ ] Enable App Groups on BOTH app/widget signing profiles
- [ ] Generate from project-with-widget.yml
- [ ] Install app and widget on real iPhone
- [ ] Add home screen widget and save new moment in app
- [ ] Confirm image refreshes on Home Screen
- [ ] Confirm App Groups entitlement works with actual Apple Developer team
- [ ] Change camera theme and verify widget border changes

## Not part of this build
- Push notifications, background live delivery, multi-person chat
- Video capture and video recap
- Complete parity with Locket or Locket Gold
- Runtime bypass of any Telegram/modded IPA login
