# Restore test evidence register

| Document code | SEC-015 |
| Version | 0.2 |
| Date | 2026-08-25 |
| Author | BizCode |
| Requirement level | Highly recommended |
| Normative applicability | ISO/IEC 27001:2022 |
| Evidence status | Partial — local Docker restore smoke recorded; staging drill pending (#197) |

## Out-of-scope statement

This register records restore/DR drill evidence. A **local smoke** does **not** satisfy the staging DR drill acceptance criterion of [#197](https://github.com/ayelenleclerc/BizCode/issues/197).

## Purpose

Track timed restore exercises (local and staging) against RTO &lt; 4 hours.

## Entries

| Date (UTC) | Environment | Type | Artifact | Target DB | Restore wall-clock | RTO vs &lt;4h | Operator | Notes |
|------------|-------------|------|----------|-----------|--------------------|-------------|----------|-------|
| 2026-08-25T16:00:47Z | Local Docker `bizcode_db` `:5432` | Local restore smoke | `bizcode-pg-bizcode_dev-20260825T160047Z.sql.gz.enc` (~59 KB enc) | `bizcode_restore_smoke_197` (side DB; dropped after) | Backup ~1.8 s; restore ~2.8 s; smoke total ~5.4 s | Pass (path only) | Eng agent (#197) | Ephemeral `BACKUP_ENCRYPTION_KEY` for smoke; **not** staging; does not close #197 AC |
| _(pending)_ | Staging remote | Semiannual DR drill | _(pending)_ | _(pending)_ | _(pending)_ | _(pending)_ | _(pending)_ | Requires `STAGING_DEPLOY_*` host |

## Related

- [Disaster recovery](../../quality/disaster-recovery.md)
- [Backup and restore](../../quality/backup-and-restore.md)

## Revision history

| Version | Date | Author | Summary of changes |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Initial stub |
| 0.2 | 2026-08-25 | BizCode | Local smoke row for #197 |
