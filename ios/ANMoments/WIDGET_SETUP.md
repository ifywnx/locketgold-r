# Optional WidgetKit setup

The main project deliberately excludes WidgetKit extension so it can be signed with a free Personal Team without requiring optional App Groups capabilities.

To enable:
1. Confirm your Apple Developer team supports **App Groups** on your provisioning profile.
2. Generate from \`project-with-widget.yml\`:
   \`\`\`bash
   xcodegen generate --spec project-with-widget.yml
   open ANMoments.xcodeproj
   \`\`\`
3. In Xcode select BOTH app and widget targets > Signing & Capabilities. Choose the same team.
4. Make sure both have App Group \`group.com.ifywnx.anmoments\` enabled and registered.
5. Run app, save an image locally, then add widget via iPhone Home Screen > Edit > Add Widget.
6. App stores the latest local image in the shared container. Cloud-mode widget image is refreshed only on app sync, not via background push.

If code signing fails with unsupported entitlements, revert to:
\`\`\`bash
xcodegen generate --spec project.yml
\`\`\`
This removes the widget target from the generated project without affecting core app source.
