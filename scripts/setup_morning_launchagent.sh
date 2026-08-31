#!/usr/bin/env bash
# Installs or uninstalls the macOS LaunchAgent for Scout 144 daily morning updates

PLIST_NAME="com.scout144.morningupdate.plist"
SOURCE_PLIST="$(cd "$(dirname "$0")" && pwd)/$PLIST_NAME"
TARGET_DIR="$HOME/Library/LaunchAgents"
TARGET_PLIST="$TARGET_DIR/$PLIST_NAME"

case "$1" in
  install)
    echo "Installing Scout 144 Daily Morning Update LaunchAgent..."
    mkdir -p "$TARGET_DIR"
    cp "$SOURCE_PLIST" "$TARGET_PLIST"
    launchctl unload "$TARGET_PLIST" 2>/dev/null || true
    launchctl load "$TARGET_PLIST"
    echo "✅ LaunchAgent loaded successfully! It will run daily at 8:00 AM EST (5:00 AM PST)."
    ;;
  uninstall)
    echo "Uninstalling Scout 144 Daily Morning Update LaunchAgent..."
    launchctl unload "$TARGET_PLIST" 2>/dev/null || true
    rm -f "$TARGET_PLIST"
    echo "✅ LaunchAgent removed."
    ;;
  status)
    echo "Checking LaunchAgent status..."
    launchctl list | grep "com.scout144.morningupdate" || echo "LaunchAgent is not currently loaded."
    ;;
  *)
    echo "Usage: $0 {install|uninstall|status}"
    exit 1
    ;;
esac
