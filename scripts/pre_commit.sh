#!/usr/bin/env bash
export DEVELOPER_DIR=/Library/Developer/CommandLineTools
export PATH="/Users/ericmiller/.homebrew/bin:$PATH"
set -e

echo "[PRE-COMMIT GUARD] Running automated smoke tests..."

node scripts/smoke_test.js

if [ $? -ne 0 ]; then
  echo "❌ Pre-commit smoke test failed! Commit aborted."
  exit 1
fi

echo "[PRE-COMMIT GUARD] ✅ All tests passed. Proceeding with commit."
