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

swift scripts/generate_icons.swift
xcodegen generate --spec project-with-widget.yml
open ANMoments.xcodeproj

echo "Opened AN Moments with its WidgetKit extension."
echo "For installation, select your Apple Development Team and verify the App Groups entitlement."
echo "App Groups and remote push capabilities may require a paid Apple Developer membership."
