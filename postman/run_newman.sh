#!/usr/bin/env bash
# Jalankan seluruh automated test collection Tugas 2 (API harus hidup di :3000).
set -euo pipefail
cd "$(dirname "$0")/.."
npx --yes newman run postman/Tugas2_Lukisan.postman_collection.json \
  -e postman/Tugas2_Lukisan.postman_environment.json \
  --reporters cli
