#!/usr/bin/env bash
# Restore wrapper — forwards args (require --yes for destructive restore).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec npx tsx scripts/restore-postgres.ts "$@"
