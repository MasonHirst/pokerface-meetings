#!/bin/bash
set -e

echo ""
echo "NOTE: This script requires the client to be built before running."
echo "      Run 'npm run build --prefix client' if you haven't already."
echo ""

echo "=== SERVER TESTS ==="
npm test --prefix server

echo ""
echo "=== CLIENT TESTS ==="
CI=true npm test --prefix client

echo ""
echo "=== E2E TESTS ==="
npx playwright test
