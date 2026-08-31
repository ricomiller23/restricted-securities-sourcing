#!/bin/bash

# Move to the project directory
cd "/Users/ericmiller/NEW JUNE 26"

echo "============================================="
echo "   Launching Scout 144 Sourcing Console...   "
echo "============================================="

# Find and kill any existing processes running on port 3000 or 5005
echo "Clearing ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5005 | xargs kill -9 2>/dev/null

# Start the dev server (both frontend and backend concurrently)
npm run dev &

# Wait for Vite dev server to respond (fast active polling)
echo "Waiting for dev server readiness..."
for i in {1..50}; do
  if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/" 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 0.05
done

# Open in Google Chrome immediately upon readiness
echo "Opening Chrome..."
open -a "Google Chrome" "http://127.0.0.1:3000/"

echo "Scout 144 is active! Close this window to stop the server."
wait
