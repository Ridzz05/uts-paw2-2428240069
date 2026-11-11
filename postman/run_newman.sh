#!/usr/bin/env bash
# Jalankan seluruh automated test collection UTS (API harus hidup di :3000, data hasil npm run seed).
set -euo pipefail
cd "$(dirname "$0")/.."
npx --yes newman run postman/UTS_Film.postman_collection.json \
  -e postman/UTS_Film.postman_environment.json \
  --reporters cli
