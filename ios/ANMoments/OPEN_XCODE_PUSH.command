#!/bin/zsh
set -e
cd "$(dirname "$0")"
if ! command -v xcodegen >/dev/null 2>&1; then
  brew install xcodegen
fi
swift scripts/generate_icons.swift
xcodegen generate --spec project-with-push.yml
open ANMoments.xcodeproj
echo "Requires Apple Developer Push Notifications capability and paid team."
