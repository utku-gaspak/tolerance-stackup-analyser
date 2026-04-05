
#!/usr/bin/env bash

set -euo pipefail



BASE_URL="${BASE_URL:-https://tolstackup.com}"



echo "Using BASE_URL=$BASE_URL"

BASE_URL="$BASE_URL" node scripts/capture-screenshots.mjs

BASE_URL="$BASE_URL" node scripts/export-pdf.mjs



echo

echo "Done."

echo "Screenshots: artifacts/screenshots"

echo "PDF: artifacts/downloads"

