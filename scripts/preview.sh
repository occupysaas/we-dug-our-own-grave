#!/usr/bin/env bash
# Half-res preview of the whole film (or a frame range: scripts/preview.sh 0-299)
cd "$(dirname "$0")/.."
range=${1:+--frames=$1}
time npx remotion render src/index.ts Video out/preview.mp4 --scale=0.5 $range
