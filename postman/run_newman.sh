#!/usr/bin/env bash
# Jalankan seluruh automated test collection Tugas 2 (API harus hidup di :3000).
set -euo pipefail
cd "$(dirname "$0")/.."
npx --yes newman run postman/Tugas3_Bioskop.postman_collection.json \
  -e postman/Tugas3_Bioskop.postman_environment.json \
  --reporters cli
