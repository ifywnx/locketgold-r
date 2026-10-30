#!/bin/zsh
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v xcodegen >/dev/null 2>&1; then
  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew not found. Install XcodeGen first."
    exit 1
  fi
  brew install xcodegen
fi

echo "=== Parse app and widget Swift sources ==="
xcrun swiftc -frontend -parse App/*.swift
xcrun swiftc -frontend -parse Widget/*.swift

echo "=== Generate original app icons ==="
swift scripts/generate_icons.swift

echo "=== Generate Xcode project WITH WidgetKit extension ==="
xcodegen generate --spec project-with-widget.yml

echo "=== Build app + widget without signing ==="
xcodebuild -project ANMoments.xcodeproj \
  -scheme ANMoments \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO \
  build

echo "Build passed for the configured app and widget targets."
echo "This is an unsigned compile only; it does not install or validate APNs/App Groups on an iPhone."
