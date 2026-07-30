#!/usr/bin/env bash
# Prune wrapper — optional --dry-run
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec npx tsx scripts/prune-postgres-backups.ts "$@"
