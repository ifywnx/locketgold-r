#!/bin/zsh
set -e
cd "$(dirname "$0")"
if ! command -v xcodegen >/dev/null 2>&1; then
  echo "Run brew install xcodegen first."
  exit 1
fi
echo "=== Checking Swift syntax ==="
xcrun swiftc -frontend -parse App/*.swift
xcrun swiftc -frontend -parse Widget/*.swift
echo "=== Generating original app icons ==="
swift scripts/generate_icons.swift
echo "=== Generating Xcode project ==="
xcodegen generate --spec project.yml
echo "=== Building unsigned iOS target ==="
xcodebuild -project ANMoments.xcodeproj \
  -scheme ANMoments \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO \
  build
