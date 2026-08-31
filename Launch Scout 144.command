#!/bin/bash

# Move to the project directory
cd "/Users/ericmiller/NEW JUNE 26"

START_TIME=$(node -e 'console.log(Date.now())')

get_elapsed() {
  node -e "console.log(((Date.now() - $START_TIME) / 1000).toFixed(2) + 's')"
}

echo "============================================="
echo "   Launching Scout 144 Sourcing Console...   "
echo "============================================="

# 1. Clear ports
echo "[$(get_elapsed)] Clearing previous server processes (ports 3000, 5005)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5005 | xargs kill -9 2>/dev/null

# 2. Start dev servers
echo "[$(get_elapsed)] Spawning backend and frontend dev processes..."
npm run dev &
DEV_PID=$!

# 3. Active readiness polling
echo "[$(get_elapsed)] Polling port readiness (Vite & Express)..."
for i in {1..60}; do
  VITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/" 2>/dev/null || echo "000")
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:5005/api/metrics" 2>/dev/null || echo "000")
  
  if [ "$VITE_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
    break
  fi
  sleep 0.04
done

ELAPSED_TOTAL=$(node -e "console.log(Date.now() - $START_TIME)")
echo "[$(get_elapsed)] ✅ All servers fully ready! (Total launch time: ${ELAPSED_TOTAL}ms)"

# 4. Open browser
echo "[$(get_elapsed)] Opening Google Chrome at http://127.0.0.1:3000/ ..."
open -a "Google Chrome" "http://127.0.0.1:3000/"

echo ""
echo "Scout 144 is active! Press Ctrl+C or close this terminal window to stop."
wait $DEV_PID
