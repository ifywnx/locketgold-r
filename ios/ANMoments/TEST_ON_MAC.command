#!/bin/zsh
set -e
cd "$(dirname "$0")"
if ! command -v xcodegen >/dev/null 2>&1; then
  echo "Run brew install xcodegen first."
  exit 1
fi
swift scripts/generate_icons.swift
xcodegen generate --spec project.yml
xcodebuild -project ANMoments.xcodeproj \
  -scheme ANMoments \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO \
  build
