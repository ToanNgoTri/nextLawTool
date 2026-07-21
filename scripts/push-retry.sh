#!/usr/bin/env bash
cd "$(dirname "$0")/.."
for attempt in $(seq 1 120); do
  echo "===== push attempt $attempt at $(date '+%H:%M:%S') ====="
  node scripts/firestoreToMongo.mjs push
  code=$?
  if [ $code -eq 0 ]; then
    echo "===== PUSH COMPLETED (attempt $attempt) ====="
    exit 0
  fi
  echo "----- attempt $attempt failed (exit $code); server may be down; waiting 30s -----"
  sleep 30
done
echo "===== gave up after 120 attempts ====="
exit 1
