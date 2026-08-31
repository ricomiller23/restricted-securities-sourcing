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

# Wait for Vite to boot up
sleep 2

# Open in Google Chrome
echo "Opening Chrome..."
open -a "Google Chrome" "http://127.0.0.1:3000/"

echo "Scout 144 is active! Close this window to stop the server."
wait
