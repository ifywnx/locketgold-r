#!/bin/zsh
set -e
cd "$(dirname "$0")"
if ! command -v xcodegen >/dev/null 2>&1; then
  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew not found. Install XcodeGen from https://github.com/yonaskolb/XcodeGen"
    exit 1
  fi
  brew install xcodegen
fi
xcodegen generate --spec project.yml
open ANMoments.xcodeproj
echo "Chọn Apple Personal Team và iPhone trong Xcode, sau đó Command+R."
