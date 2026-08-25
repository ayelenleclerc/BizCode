# PostgreSQL backup and restore (#150)

## Purpose

Describes the automated PostgreSQL backup pipeline shipped in-repo: logical `pg_dump`, gzip, AES-256-GCM encryption, local retention (7 daily / 4 weekly / 3 monthly), optional S3/R2 upload via AWS CLI, and a verified restore path. Complements ISO [SEC-007](../certificacion-iso/sec/sec-007-backup-and-restore-procedure.md).

**Evidence status:** Implemented in product scripts (local Docker `:5432` verified on the development host). Staging/production restore drills remain an operational step once remote hosts from [#152](https://github.com/ayelenleclerc/BizCode/issues/152) / [deployment-environments.md](deployment-environments.md) are provisioned. Not a certification claim.

## Components (evidence)

| Piece | Path / command |
|-------|----------------|
| Backup job | [`scripts/backup-postgres.ts`](../../../scripts/backup-postgres.ts) — `npm run backup:postgres` |
| Restore | [`scripts/restore-postgres.ts`](../../../scripts/restore-postgres.ts) — `npm run backup:postgres:restore -- --list` / `--file … --yes` |
| Prune | [`scripts/prune-postgres-backups.ts`](../../../scripts/prune-postgres-backups.ts) — `npm run backup:postgres:prune` |
| Crypto / retention | [`scripts/lib/postgres-backup/`](../../../scripts/lib/postgres-backup/) |
| Cron wrappers (Linux) | `scripts/backup-postgres.sh`, `restore-postgres.sh`, `prune-postgres-backups.sh` |
| Unit tests | [`tests/scripts/postgres-backup.test.ts`](../../../tests/scripts/postgres-backup.test.ts) |

## Schedule

| Schedule (UTC) | Command | Notes |
|----------------|---------|-------|
| `0 2 * * *` | `npm run backup:postgres` then `npm run backup:postgres:prune` | Preferred nightly window |
| Monitoring | Alert if no successful backup artifact newer than **26 hours** | Ops check; optional `SECURITY_ALERT_EMAILS` on job failure |

## Environment

Documented in [`.env.example`](../../../.env.example):

| Variable | Role |
|----------|------|
| `BACKUP_ENCRYPTION_KEY` | **Required.** Passphrase → SHA-256 → AES-256-GCM key. Never commit or log. |
| `BIZCODE_BACKUP_DIR` | Local destination (default `.bizcode-backups/`, gitignored). |
| `BIZCODE_BACKUP_S3_URI` | Optional `s3://…` prefix; upload via `aws s3 cp` (soft-fail if CLI/creds missing). |
| `BIZCODE_POSTGRES_CONTAINER` | Docker container name (default `bizcode_db`). |
| `BIZCODE_POSTGRES_USER` / `BIZCODE_POSTGRES_DB` | Defaults `postgres` / `bizcode_dev`. |
| `BIZCODE_BACKUP_USE_DOCKER` | Default `true` (prefer `docker exec` on Windows). Set `false` to use host `pg_dump`/`psql`. |
| `SECURITY_ALERT_EMAILS` + SMTP | Soft-fail email when backup fails. |

Local Postgres: [`docker-compose.postgres.yml`](../../../docker-compose.postgres.yml) (`5432:5432`, DB `bizcode_dev`) or an equivalent container already bound to `:5432`.

## Artifact format

- File name: `bizcode-pg-<db>-<YYYYMMDDTHHMMSSZ>.sql.gz.enc`
- Payload: magic `BCBK1` + IV (12) + GCM tag (16) + ciphertext of gzip(SQL dump)

## Restore (destructive)

1. List: `npm run backup:postgres:restore -- --list`
2. Restore requires explicit `--yes` (never default):

```bash
npm run backup:postgres:restore -- --file .bizcode-backups/<file>.sql.gz.enc --yes
# optional target DB:
npm run backup:postgres:restore -- --file .bizcode-backups/<file>.sql.gz.enc --db bizcode_restore_test --yes
```

Prefer a dedicated restore database for drills. Do not point at production without an approved change window.

## Remote storage policy

- **Local directory** is the DoD for this delivery.
- **S3/R2-compatible** upload is optional via AWS CLI; remote lifecycle/retention is operator-owned (mirror 7/4/3 or bucket lifecycle rules).
- **Restic** is documented as a future alternative (not shipped in this PR; no restic binary/SDK in repo).

## Out of scope (this delivery)

- Restic integration
- `@aws-sdk` client in the Node app
- Staging/production host provisioning (residual of [#152](https://github.com/ayelenleclerc/BizCode/issues/152); see [deployment-environments.md](deployment-environments.md))
- Mobile / Mercado Pago / ARCA changes

## Related

- [SEC-007 Backup and restore procedure](../certificacion-iso/sec/sec-007-backup-and-restore-procedure.md)
- [Disaster recovery (#197)](disaster-recovery.md)
- [SLA (#197)](sla.md)
- [CI/CD — scheduled jobs](ci-cd.md)
- [Log sanitization policy](log-sanitization-policy.md)
- [Secrets management / Doppler](secrets-management-and-doppler.md)
