#!/bin/bash

# Parse command line arguments
PORT=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --port)
      PORT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set VITE_DEV_PORT if port is provided
if [ -n "$PORT" ]; then
  export VITE_DEV_PORT="$PORT"
  echo "Setting VITE_DEV_PORT to $PORT"
fi

# Run the original command
pnpm config:electron:dash:development && vite build -c electron.vite.config.mts && cross-env NODE_ENV=development BUILD_ENV=dev CUSTOM_MODE=dash.development concurrently "pnpm dev" "wait-on http://127.0.0.1:3006 && electron ."