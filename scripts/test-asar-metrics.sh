#!/bin/bash
set -euo pipefail

# test-asar-metrics.sh
# Measures asar build metrics: package size, compression ratio, build time

RELEASE_DIR="./release"
METRICS_FILE="${RELEASE_DIR}/asar-metrics.json"

echo "📊 Collecting asar metrics..."
echo ""

# Find the most recent .deb file
DEB_FILE=$(ls -t "${RELEASE_DIR}"/*.deb 2>/dev/null | head -1)
if [ -z "$DEB_FILE" ]; then
  echo "❌ No .deb file found in ${RELEASE_DIR}/"
  exit 1
fi

DEB_SIZE=$(stat -f%z "$DEB_FILE" 2>/dev/null || stat -c%s "$DEB_FILE" 2>/dev/null || du -b "$DEB_FILE" | cut -f1)
DEB_SIZE_MB=$(echo "scale=2; $DEB_SIZE / 1024 / 1024" | bc)
DEB_NAME=$(basename "$DEB_FILE")

echo "📦 Package: $DEB_NAME"
echo "📏 Size: ${DEB_SIZE_MB} MB ($(numfmt --to=iec-i --suffix=B "$DEB_SIZE" 2>/dev/null || echo "$DEB_SIZE bytes"))"
echo ""

# Check unpacked directory structure
UNPACKED_DIR="${RELEASE_DIR}/linux-arm64-unpacked"
if [ -d "$UNPACKED_DIR" ]; then
  echo "📂 Unpacked directory structure:"

  # Get unpacked directory size
  UNPACKED_SIZE=$(du -sb "$UNPACKED_DIR" | cut -f1)
  UNPACKED_SIZE_MB=$(echo "scale=2; $UNPACKED_SIZE / 1024 / 1024" | bc)
  echo "  Total: ${UNPACKED_SIZE_MB} MB"

  # Check for asar archive
  if [ -f "$UNPACKED_DIR/app.asar" ]; then
    ASAR_SIZE=$(stat -f%z "$UNPACKED_DIR/app.asar" 2>/dev/null || stat -c%s "$UNPACKED_DIR/app.asar" 2>/dev/null || du -b "$UNPACKED_DIR/app.asar" | cut -f1)
    ASAR_SIZE_MB=$(echo "scale=2; $ASAR_SIZE / 1024 / 1024" | bc)
    echo "  ✅ app.asar: ${ASAR_SIZE_MB} MB"

    # Calculate compression ratio
    RATIO=$(echo "scale=2; (($UNPACKED_SIZE - $ASAR_SIZE) / $UNPACKED_SIZE) * 100" | bc)
    echo "  📈 Compression ratio: ${RATIO}% (asar vs unpacked JS)"
  else
    echo "  ⚠️  No app.asar found (asar might be disabled)"
  fi

  # Check unpacked directory size
  UNPACKED_UNCOMPRESSED=$(du -sb "$UNPACKED_DIR/app.asar.unpacked" 2>/dev/null | cut -f1 || echo 0)
  if [ "$UNPACKED_UNCOMPRESSED" -gt 0 ]; then
    UNPACKED_UNCOMPRESSED_MB=$(echo "scale=2; $UNPACKED_UNCOMPRESSED / 1024 / 1024" | bc)
    echo "  📦 app.asar.unpacked: ${UNPACKED_UNCOMPRESSED_MB} MB"
  fi

  # Check Python service sizes
  if [ -d "$UNPACKED_DIR/resources/python-service" ]; then
    echo ""
    echo "🐍 Python services:"
    for service in kt_service print_service tts_service; do
      if [ -f "$UNPACKED_DIR/resources/python-service/$service" ]; then
        SIZE=$(stat -f%z "$UNPACKED_DIR/resources/python-service/$service" 2>/dev/null || stat -c%s "$UNPACKED_DIR/resources/python-service/$service" 2>/dev/null || echo 0)
        SIZE_MB=$(echo "scale=2; $SIZE / 1024 / 1024" | bc)
        echo "  ✅ $service: ${SIZE_MB} MB"
      fi
    done
  fi
  echo ""
else
  echo "⚠️  Unpacked directory not found: $UNPACKED_DIR"
fi

# Save metrics to JSON
cat > "$METRICS_FILE" <<EOF
{
  "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "deb_file": "$DEB_NAME",
  "deb_size_bytes": $DEB_SIZE,
  "deb_size_mb": $DEB_SIZE_MB,
  "unpacked_size_bytes": ${UNPACKED_SIZE:-0},
  "unpacked_size_mb": ${UNPACKED_SIZE_MB:-0},
  "asar_size_bytes": ${ASAR_SIZE:-0},
  "asar_size_mb": ${ASAR_SIZE_MB:-0},
  "compression_ratio": "${RATIO:-N/A}%"
}
EOF

echo "💾 Metrics saved to: $METRICS_FILE"
echo ""
echo "✅ Done!"
