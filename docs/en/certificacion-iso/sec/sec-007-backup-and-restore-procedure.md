# Backup and restore procedure

| Document code | SEC-007 |
| Version | 0.2 |
| Date | 2026-07-30 |
| Author | BizCode |
| Requirement level | Highly recommended |
| Normative applicability | ISO/IEC 27001:2022 |
| Evidence status | Partial — product scripts evidenced (#150); org-wide DR drills pending staging (#152) |

## Out-of-scope statement

This document describes BizCode product backup/restore tooling. It does not claim ISO/IEC 27001 certification.


## Purpose

Define how PostgreSQL data is backed up, encrypted, retained, and restored for BizCode deployments using in-repo scripts.

## Product evidence (#150)

Operational narrative (trilingual): [Backup and restore](../../quality/backup-and-restore.md).

| Control element | Evidence in repo |
|-----------------|------------------|
| Logical dump | `npm run backup:postgres` → `pg_dump` via Docker exec or host CLI |
| Encryption at rest (artifact) | AES-256-GCM with `BACKUP_ENCRYPTION_KEY` (`scripts/lib/postgres-backup/crypto.ts`) |
| Local retention | 7 daily / 4 weekly / 3 monthly (`prune-postgres-backups`) |
| Optional offsite | `BIZCODE_BACKUP_S3_URI` + AWS CLI `aws s3 cp` (soft-fail) |
| Restore | `npm run backup:postgres:restore -- --file … --yes` |
| Failure alert | Soft-fail email via `SECURITY_ALERT_EMAILS` + SMTP when configured |
| Schedule | Cron `0 2 * * *` UTC (ops host; not GitHub Actions default) |

## Operator checklist

1. Ensure Postgres container/`pg_dump` reachable and `BACKUP_ENCRYPTION_KEY` injected (Doppler or host secret).
2. Run nightly backup + prune; verify artifact age &lt; 26 h.
3. Quarterly restore drill to a non-production database; record result in ops change log.
4. Staging/production restore drills: blocked until [#152](https://github.com/ayelenleclerc/BizCode/issues/152) environments exist.

## Revision history

| Version | Date | Author | Summary of changes |
|--------------|-----------|-------------|----------------|
| 0.2 | 2026-07-30 | BizCode | Product evidence for #150 scripts; link to quality narrative |
| 0.1 | 2026-04-01 | BizCode | Initial stub |
