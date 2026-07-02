#!/usr/bin/env bash
set -euo pipefail

# ── Usage ──────────────────────────────────────────────────────────────────────
# bash scripts/publish-npm.sh [--version X.Y.Z]
#
# NPM_TOKEN is read from the shell env if set, else loaded from a root .env
# file (gitignored). Explicit env var still overrides: NPM_TOKEN=<token> bash ...
#
# Publishes all workspace packages to npm under the @dashadmin scope.
# Package names are transformed:  dash-foo → @dashadmin/dash-foo
# Internal cross-dependencies are also rewritten to the scoped name.
#
# Existing @dashadmin/* packages are unpublished first (best-effort).
# A version bump is used so the publish succeeds immediately without
# waiting for npm's 24-hour name-reuse cooldown.

REGISTRY="https://registry.npmjs.org"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGES_DIR="$ROOT/packages"
NPM_SCOPE="@dashadmin"
ROOT_PKG_JSON="$ROOT/package.json"

# Load a root .env file (gitignored) without overriding anything already set
# in the shell, so NPM_TOKEN doesn't need to be exported by hand every time.
if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

# ── Parse args ─────────────────────────────────────────────────────────────────
PUBLISH_VERSION=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --version) PUBLISH_VERSION="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# Root package.json's version is the single source of truth every published
# package aligns to. Bump it here (not just read it) so every real run gets a
# fresh version automatically — no more remembering --version by hand and no
# more accidental re-publishes of an already-used version.
CURRENT_VERSION=$(node -e "process.stdout.write(require('$ROOT_PKG_JSON').version)")
if [ -n "$PUBLISH_VERSION" ]; then
  echo "Using explicit --version $PUBLISH_VERSION (root package.json left untouched)"
else
  PUBLISH_VERSION=$(node -e "
    const v = '$CURRENT_VERSION'.split('.').map(Number);
    while (v.length < 3) v.push(0);
    v[2] += 1;
    process.stdout.write(v.join('.'));
  ")
  echo "No --version given — bumping root package.json $CURRENT_VERSION -> $PUBLISH_VERSION"
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$ROOT_PKG_JSON', 'utf8'));
    pkg.version = '$PUBLISH_VERSION';
    fs.writeFileSync('$ROOT_PKG_JSON', JSON.stringify(pkg, null, 2) + '\n');
  "
fi

# ── Validate token ─────────────────────────────────────────────────────────────
if [ -z "${NPM_TOKEN:-}" ]; then
  echo "ERROR: NPM_TOKEN environment variable is required."
  echo "  NPM_TOKEN=<token> bash scripts/publish-npm.sh"
  exit 1
fi

echo "Authenticating with npm registry..."
NPM_CONFIG_REGISTRY="$REGISTRY" npm whoami --registry "$REGISTRY" --auth-type=legacy \
  --_auth="$(echo -n ":$NPM_TOKEN" | base64)" 2>/dev/null || \
  NPM_TOKEN="$NPM_TOKEN" npm whoami --registry "$REGISTRY" 2>/dev/null || true

# Write a temporary .npmrc for auth (cleaned up on exit)
NPMRC_TMP="$(mktemp)"
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$NPMRC_TMP"
echo "registry=${REGISTRY}" >> "$NPMRC_TMP"
export NPM_CONFIG_USERCONFIG="$NPMRC_TMP"
trap 'rm -f "$NPMRC_TMP"' EXIT

echo ""
echo "Publishing version: $PUBLISH_VERSION"
echo "Scope:              $NPM_SCOPE"
echo "Registry:           $REGISTRY"

# ── Collect workspace package names ───────────────────────────────────────────
PKGS=()
for dir in "$PACKAGES_DIR"/*/; do
  pkg_json="$dir/package.json"
  [ -f "$pkg_json" ] || continue
  pkg_name=$(node -e "process.stdout.write(require('$pkg_json').name || '')")
  [ -z "$pkg_name" ] && continue
  PKGS+=("$pkg_name")
done

echo ""
echo "Workspace packages (${#PKGS[@]}):"
for p in "${PKGS[@]}"; do echo "  $p → $NPM_SCOPE/$p"; done

# ── Step 1: Unpublish all @dashadmin/* packages (best-effort) ─────────────────
echo ""
echo "── Step 1: Unpublishing existing @dashadmin/* packages ──────────────────"

# Build list of all @dashadmin/* packages currently on npm
EXISTING=$(npm search "$NPM_SCOPE" --registry "$REGISTRY" --json 2>/dev/null \
  | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.forEach(p=>process.stdout.write(p.name+'\n'));
" 2>/dev/null || true)

if [ -z "$EXISTING" ]; then
  echo "  No existing $NPM_SCOPE packages found (or search failed)."
else
  while IFS= read -r pkg; do
    [ -z "$pkg" ] && continue
    echo -n "  Unpublishing $pkg ... "
    npm unpublish "$pkg" --force --registry "$REGISTRY" 2>&1 | tail -1 || \
      echo "  (could not unpublish — may be >72h old or too many downloads; will publish new version)"
  done <<< "$EXISTING"
fi

# ── Step 2: Build all packages ────────────────────────────────────────────────
echo ""
echo "── Step 2: Building packages ────────────────────────────────────────────"
cd "$ROOT"
pnpm turbo build --filter='./packages/*'

# ── Step 3: Transform + publish each package ──────────────────────────────────
echo ""
echo "── Step 3: Publishing packages to npm ───────────────────────────────────"

# Build a sed substitution list: s|"dash-foo"|"@dashadmin/dash-foo"|g for each pkg
SED_ARGS=()
for pkg_name in "${PKGS[@]}"; do
  SED_ARGS+=(-e "s|\"${pkg_name}\"|\"${NPM_SCOPE}/${pkg_name}\"|g")
done

PUBLISHED=()
FAILED=()

for dir in "$PACKAGES_DIR"/*/; do
  pkg_json="$dir/package.json"
  [ -f "$pkg_json" ] || continue
  pkg_name=$(node -e "process.stdout.write(require('$pkg_json').name || '')")
  [ -z "$pkg_name" ] && continue

  scoped_name="${NPM_SCOPE}/${pkg_name}"
  echo ""
  echo "  Publishing $scoped_name@$PUBLISH_VERSION ..."

  # Create a temp package.json with scope + version rewrite
  pkg_json_backup="${pkg_json}.npm_bak"
  cp "$pkg_json" "$pkg_json_backup"

  node - <<NODEEOF
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$pkg_json', 'utf8'));
// Scope the name
pkg.name = '$scoped_name';
// Bump version
pkg.version = '$PUBLISH_VERSION';
// Remove private flag
delete pkg.private;
// Set publishConfig for npm
pkg.publishConfig = { access: 'public', registry: '$REGISTRY' };
// Rewrite internal dash-* dependencies to @dashadmin/
const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const pkgNames = ${PKGS_JSON:-'[]'};
for (const section of sections) {
  if (!pkg[section]) continue;
  for (const [dep, ver] of Object.entries(pkg[section])) {
    if (pkgNames.includes(dep)) {
      delete pkg[section][dep];
      pkg[section]['$NPM_SCOPE/' + dep] = ver;
    }
  }
}
fs.writeFileSync('$pkg_json', JSON.stringify(pkg, null, '\t') + '\n');
NODEEOF

  # Inject the pkgs array into the node script
  PKGS_JSON_STR=$(node -e "process.stdout.write(JSON.stringify(${PKGS[@]@Q}.split(' ')))" 2>/dev/null || \
    python3 -c "import json,sys; print(json.dumps('${PKGS[*]}'.split()))")

  # Rewrite using proper JSON array
  node - <<NODEEOF2
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$pkg_json', 'utf8'));
pkg.name = '$scoped_name';
pkg.version = '$PUBLISH_VERSION';
delete pkg.private;
pkg.publishConfig = { access: 'public', registry: '$REGISTRY' };
const pkgNames = $(printf '"%s",' "${PKGS[@]}" | sed 's/,$//' | sed 's/^/[/' | sed 's/$/]/');
const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
for (const section of sections) {
  if (!pkg[section]) continue;
  for (const dep of Object.keys(pkg[section])) {
    if (pkgNames.includes(dep)) {
      const ver = pkg[section][dep];
      delete pkg[section][dep];
      pkg[section]['$NPM_SCOPE/' + dep] = ver;
    }
  }
}
fs.writeFileSync('$pkg_json', JSON.stringify(pkg, null, '\t') + '\n');
NODEEOF2

  # Publish
  if npm publish "$dir" --registry "$REGISTRY" --access public --no-git-checks 2>&1; then
    PUBLISHED+=("$scoped_name@$PUBLISH_VERSION")
  else
    FAILED+=("$scoped_name")
  fi

  # Restore original package.json
  mv "$pkg_json_backup" "$pkg_json"
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "── Done ─────────────────────────────────────────────────────────────────"
echo ""
echo "Published (${#PUBLISHED[@]}):"
for p in "${PUBLISHED[@]}"; do echo "  ✓ $p"; done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "Failed (${#FAILED[@]}):"
  for p in "${FAILED[@]}"; do echo "  ✗ $p"; done
  exit 1
fi

echo ""
echo "All packages published to $REGISTRY under $NPM_SCOPE"
echo "View at: https://www.npmjs.com/org/dashadmin"
