#!/bin/bash
set -euo pipefail

# verify-production-optimizations.sh
# Checks if production optimizations (minification, console stripping) are properly configured

echo "🔍 Verifying production optimizations..."
echo ""

ERRORS=0

# Check 1: electron.vite.config.mts has conditional minification
echo "✓ Checking electron.vite.config.mts minification..."
if grep -q "minify: isProduction ? 'esbuild' : false" electron.vite.config.mts; then
  echo "  ✅ Electron main/preload minification enabled for production"
else
  echo "  ❌ FAILED: minify is not conditional"
  ERRORS=$((ERRORS + 1))
fi

# Check 2: app vite.config has console stripping enabled
echo "✓ Checking app vite.config console stripping..."
if grep -q "drop: isProduction ? \['console', 'debugger'\]" apps/kitchntabs-app/vite.config.mts; then
  echo "  ✅ Console stripping enabled for production"
else
  echo "  ❌ FAILED: console drop is not enabled or commented out"
  ERRORS=$((ERRORS + 1))
fi

# Check 3: electron main has environment-aware logging
echo "✓ Checking electron main logging configuration..."
if grep -q "const isProduction = BUILD_ENV === 'prod'" apps/kitchntabs-app/electron/main/index.ts; then
  echo "  ✅ Environment-aware logging configured"
else
  echo "  ❌ FAILED: isProduction check not found"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "log.transports.console.level = consoleLogLevel;" apps/kitchntabs-app/electron/main/index.ts; then
  echo "  ✅ Console log level is dynamic"
else
  echo "  ❌ FAILED: console log level not dynamic"
  ERRORS=$((ERRORS + 1))
fi

# Check 4: Verify asar is enabled
echo "✓ Checking asar configuration..."
if grep -q "asar: true" electron-builder.config.js; then
  echo "  ✅ Asar is enabled"
else
  echo "  ❌ FAILED: asar is disabled"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "asarUnpack:" electron-builder.config.js; then
  echo "  ✅ asarUnpack is configured"
else
  echo "  ❌ FAILED: asarUnpack not configured"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo "✅ All production optimizations are properly configured!"
  echo ""
  echo "📊 Optimization summary:"
  echo "   • Renderer console stripping: ENABLED"
  echo "   • Electron minification: ENABLED"
  echo "   • Environment-aware logging: ENABLED"
  echo "   • Asar compression: ENABLED"
  echo ""
  echo "🚀 Expected bundle size reduction: 25-35%"
  exit 0
else
  echo "❌ $ERRORS configuration issue(s) found!"
  echo ""
  echo "See PRODUCTION_OPTIMIZATIONS.md for details"
  exit 1
fi
