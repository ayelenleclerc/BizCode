# Copia de seguridad y restauración PostgreSQL (#150)

## Propósito

Describe el pipeline de backup automático de PostgreSQL en el repositorio: `pg_dump` lógico, gzip, cifrado AES-256-GCM, retención local (7 diarios / 4 semanales / 3 mensuales), upload opcional S3/R2 vía AWS CLI y restauración verificable. Complementa ISO [SEC-007](../certificacion-iso/sec/sec-007-backup-restauracion.md).

**Estado de evidencia:** Implementado en scripts de producto (verificado contra Docker local `:5432` en el host de desarrollo). El drill de restore en staging/producción queda como paso operativo cuando existan hosts remotos de [#152](https://github.com/ayelenleclerc/BizCode/issues/152) / [entornos-despliegue.md](entornos-despliegue.md). No es una afirmación de certificación.

## Componentes (evidencia)

| Pieza | Ruta / comando |
|-------|----------------|
| Job de backup | [`scripts/backup-postgres.ts`](../../../scripts/backup-postgres.ts) — `npm run backup:postgres` |
| Restore | [`scripts/restore-postgres.ts`](../../../scripts/restore-postgres.ts) — `npm run backup:postgres:restore -- --list` / `--file … --yes` |
| Prune | [`scripts/prune-postgres-backups.ts`](../../../scripts/prune-postgres-backups.ts) — `npm run backup:postgres:prune` |
| Crypto / retención | [`scripts/lib/postgres-backup/`](../../../scripts/lib/postgres-backup/) |
| Wrappers cron (Linux) | `scripts/backup-postgres.sh`, `restore-postgres.sh`, `prune-postgres-backups.sh` |
| Tests unitarios | [`tests/scripts/postgres-backup.test.ts`](../../../tests/scripts/postgres-backup.test.ts) |

## Programación

| Horario (UTC) | Comando | Notas |
|---------------|---------|-------|
| `0 2 * * *` | `npm run backup:postgres` y luego `npm run backup:postgres:prune` | Ventana nocturna recomendada |
| Monitoreo | Alertar si no hay artefacto exitoso más reciente que **26 horas** | Chequeo ops; email opcional `SECURITY_ALERT_EMAILS` ante fallo |

## Variables de entorno

Documentadas en [`.env.example`](../../../.env.example):

| Variable | Rol |
|----------|-----|
| `BACKUP_ENCRYPTION_KEY` | **Obligatoria.** Passphrase → SHA-256 → clave AES-256-GCM. Nunca commit ni logs. |
| `BIZCODE_BACKUP_DIR` | Destino local (default `.bizcode-backups/`, gitignored). |
| `BIZCODE_BACKUP_S3_URI` | Prefijo `s3://…` opcional; upload con `aws s3 cp` (soft-fail sin CLI/creds). |
| `BIZCODE_POSTGRES_CONTAINER` | Contenedor Docker (default `bizcode_db`). |
| `BIZCODE_POSTGRES_USER` / `BIZCODE_POSTGRES_DB` | Defaults `postgres` / `bizcode_dev`. |
| `BIZCODE_BACKUP_USE_DOCKER` | Default `true` (preferir `docker exec` en Windows). `false` usa `pg_dump`/`psql` del host. |
| `SECURITY_ALERT_EMAILS` + SMTP | Email soft-fail si falla el backup. |

Postgres local: [`docker-compose.postgres.yml`](../../../docker-compose.postgres.yml) (`5432:5432`, DB `bizcode_dev`) o contenedor equivalente en `:5432`.

## Formato de artefacto

- Nombre: `bizcode-pg-<db>-<YYYYMMDDTHHMMSSZ>.sql.gz.enc`
- Payload: magic `BCBK1` + IV (12) + tag GCM (16) + ciphertext de gzip(dump SQL)

## Restauración (destructiva)

1. Listar: `npm run backup:postgres:restore -- --list`
2. Restore exige `--yes` explícito:

```bash
npm run backup:postgres:restore -- --file .bizcode-backups/<file>.sql.gz.enc --yes
npm run backup:postgres:restore -- --file .bizcode-backups/<file>.sql.gz.enc --db bizcode_restore_test --yes
```

Preferir una base dedicada para drills. No apuntar a producción sin ventana de cambio aprobada.

## Política de almacenamiento remoto

- El **directorio local** cumple el DoD de esta entrega.
- Upload **S3/R2** es opcional vía AWS CLI; retención remota es responsabilidad del operador.
- **Restic** queda como alternativa futura (no incluido en esta PR).

## Fuera de alcance (esta entrega)

- Integración Restic
- Cliente `@aws-sdk` en la app Node
- Provisionamiento staging/producción (residual de [#152](https://github.com/ayelenleclerc/BizCode/issues/152); véase [entornos-despliegue.md](entornos-despliegue.md))
- Cambios mobile / Mercado Pago / ARCA

## Relacionado

- [SEC-007 Procedimiento de backup y restauración](../certificacion-iso/sec/sec-007-backup-restauracion.md)
- [Recuperación ante desastres (#197)](recuperacion-ante-desastres.md)
- [SLA (#197)](sla.md)
- [CI/CD — jobs programados](ciclo-ci-cd.md)
- [Política de sanitización de logs](politica-sanitizacion-logs.md)
- [Gestión de secretos / Doppler](gestion-secretos-y-doppler.md)
