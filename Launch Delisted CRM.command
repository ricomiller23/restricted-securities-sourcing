#!/bin/bash

# Move to the delisted-crm-database directory
cd "/Users/ericmiller/NEW JUNE 26/delisted-crm-database"

START_TIME=$(node -e 'console.log(Date.now())')

get_elapsed() {
  node -e "console.log(((Date.now() - $START_TIME) / 1000).toFixed(2) + 's')"
}

echo "============================================="
echo "   Launching Delisted CRM & Intelligence...  "
echo "============================================="

# 1. Clear previous instances on port 5173
echo "[$(get_elapsed)] Clearing previous server processes (port 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 2. Start Vite dev server
echo "[$(get_elapsed)] Spawning Vite dev server..."
npm run dev -- --port 5173 &
DEV_PID=$!

# 3. Active readiness polling
echo "[$(get_elapsed)] Polling port readiness (port 5173)..."
for i in {1..60}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:5173/" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    break
  fi
  sleep 0.04
done

ELAPSED_TOTAL=$(node -e "console.log(Date.now() - $START_TIME)")
echo "[$(get_elapsed)] ✅ Delisted CRM ready! (Total launch time: ${ELAPSED_TOTAL}ms)"

# 4. Open browser
echo "[$(get_elapsed)] Opening Google Chrome at http://127.0.0.1:5173/ ..."
open -a "Google Chrome" "http://127.0.0.1:5173/"

echo ""
echo "Delisted CRM is active! Press Ctrl+C or close this terminal window to stop."
wait $DEV_PID
