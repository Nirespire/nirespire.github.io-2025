#!/usr/bin/env bash

# === Configuration ===
CONSUMER_KEY="your-pocket-consumer-key"
REDIRECT_URI="https://getpocket.com/connected_applications"

# === Step 1: Get a request token ===
echo "Requesting Pocket request token..."
RESPONSE=$(curl -sS -X POST "https://getpocket.com/v3/oauth/request" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d "{\"consumer_key\":\"$CONSUMER_KEY\", \"redirect_uri\":\"$REDIRECT_URI\"}")

REQUEST_TOKEN=$(echo $RESPONSE | sed -n 's/.*code=\([^&]*\).*/\1/p')

if [ -z "$REQUEST_TOKEN" ]; then
  echo "Failed to obtain request token."
  exit 1
fi

echo "Received request token: $REQUEST_TOKEN"

# === Step 2: Open browser for user authorization ===
AUTH_URL="https://getpocket.com/auth/authorize?request_token=$REQUEST_TOKEN&redirect_uri=$REDIRECT_URI"

echo "Please authorize this app by visiting the following URL:"
echo "$AUTH_URL"

# Automatically open in browser (optional; works on macOS and many Linux distros)
if command -v xdg-open > /dev/null; then
  xdg-open "$AUTH_URL"
elif command -v open > /dev/null; then
  open "$AUTH_URL"
fi

# Wait for user to press Enter after authorizing
read -p "Press Enter once you have authorized the app in your browser..."

# === Step 3: Exchange request token for access token ===
echo "Exchanging request token for access token..."
ACCESS_RESPONSE=$(curl -sS -X POST "https://getpocket.com/v3/oauth/authorize" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d "{\"consumer_key\":\"$CONSUMER_KEY\", \"code\":\"$REQUEST_TOKEN\"}")

ACCESS_TOKEN=$(echo $ACCESS_RESPONSE | sed -n 's/.*access_token=\([^&]*\).*/\1/p')
USERNAME=$(echo $ACCESS_RESPONSE | sed -n 's/.*username=\([^&]*\).*/\1/p')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to obtain access token."
  exit 1
fi

echo "✅ Pocket access token retrieved!"
echo "Access Token: $ACCESS_TOKEN"
echo "Username: $USERNAME"
