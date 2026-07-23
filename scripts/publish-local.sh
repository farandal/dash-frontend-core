#!/usr/bin/env bash
set -euo pipefail

REGISTRY="http://localhost:4873"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── 1. Ensure Verdaccio is running ─────────────────────────────────────────────
if ! curl -sf "$REGISTRY" > /dev/null 2>&1; then
  echo "Starting Verdaccio..."
  verdaccio &
  VERDACCIO_PID=$!
  echo "Verdaccio PID: $VERDACCIO_PID"
  # Wait for it to be ready
  for i in $(seq 1 20); do
    sleep 1
    curl -sf "$REGISTRY" > /dev/null 2>&1 && break
    echo "  waiting... ($i)"
  done
  curl -sf "$REGISTRY" > /dev/null 2>&1 || { echo "ERROR: Verdaccio failed to start"; exit 1; }
  echo "Verdaccio is ready."
else
  echo "Verdaccio already running at $REGISTRY"
fi

# ── 2. Ensure a Verdaccio user exists ──────────────────────────────────────────
# Uses npm adduser non-interactively via expect-style input
# If npm-cli-login is available use it; otherwise fall back to curl
VERD_USER="${VERDACCIO_USER:-admin}"
VERD_PASS="${VERDACCIO_PASS:-admin123}"
VERD_EMAIL="${VERDACCIO_EMAIL:-admin@localhost}"

echo "Authenticating with Verdaccio ($REGISTRY) as '$VERD_USER'..."
if command -v npm-cli-login &>/dev/null; then
  npm-cli-login -u "$VERD_USER" -p "$VERD_PASS" -e "$VERD_EMAIL" -r "$REGISTRY" 2>/dev/null || true
else
  # Create/login via npm adduser (non-interactive with heredoc)
  # First try to add the user via REST API (Verdaccio supports this)
  curl -sf -X PUT "$REGISTRY/-/user/org.couchdb.user:$VERD_USER" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$VERD_USER\",\"password\":\"$VERD_PASS\",\"email\":\"$VERD_EMAIL\",\"type\":\"user\"}" \
    > /tmp/verdaccio-auth.json 2>&1 || true

  # Extract token and write to .npmrc
  TOKEN=$(cat /tmp/verdaccio-auth.json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null || echo "")
  if [ -n "$TOKEN" ]; then
    # Write auth token to user-level npmrc (scoped to local registry)
    HOST=$(echo "$REGISTRY" | sed 's|https\?://||')
    echo "//$HOST/:_authToken=$TOKEN" >> "$HOME/.npmrc"
    echo "Auth token saved to ~/.npmrc"
  else
    echo "WARN: Could not extract auth token. Trying pnpm login..."
    # Last resort: interactive login (will prompt)
    pnpm login --registry "$REGISTRY" || true
  fi
fi

# ── 3. Build all packages first (before touching the registry) ─────────────────
echo ""
echo "Building all packages via Turbo..."
cd "$ROOT"
pnpm turbo build --filter='./packages/*'

# ── 4. Wipe local registry copies of dash-* packages ──────────────────────────
# Only runs after a successful build so the registry is never left empty
VERD_STORAGE="${VERDACCIO_STORAGE:-$HOME/.local/share/verdaccio/storage}"
if [ -d "$VERD_STORAGE" ]; then
  echo ""
  echo "Clearing dash-* packages from Verdaccio storage ($VERD_STORAGE)..."
  rm -rf "$VERD_STORAGE"/dash-*
fi

# ── 5. Publish all packages ────────────────────────────────────────────────────
echo ""
echo "Publishing packages to $REGISTRY..."
pnpm -r --filter='./packages/**' publish \
  --registry "$REGISTRY" \
  --no-git-checks \
  --access public

echo ""
echo "Done! All packages published to $REGISTRY"
echo "Search packages: curl $REGISTRY/-/v1/search?text=dash"
