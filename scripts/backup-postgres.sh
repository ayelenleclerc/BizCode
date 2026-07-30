#!/usr/bin/env bash
# Cron wrapper (Linux/macOS): 0 2 * * * /path/to/repo/scripts/backup-postgres.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec npx tsx scripts/backup-postgres.ts
