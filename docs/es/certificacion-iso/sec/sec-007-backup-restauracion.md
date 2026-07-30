# Procedimiento de copia de seguridad y restauración

| Código de documento | SEC-007 |
| Versión | 0.2 |
| Fecha | 2026-07-30 |
| Autor | BizCode |
| Nivel de requisito | Muy recomendado |
| Aplicabilidad normativa | ISO/IEC 27001:2022 |
| Estado de evidencia | Parcial — scripts de producto evidenciados (#150); drills DR de organización pendientes de staging (#152) |

## Declaración de fuera de alcance

Este documento describe el tooling de backup/restore del producto BizCode. No afirma certificación ISO/IEC 27001.


## Propósito

Definir cómo se respaldan, cifran, retienen y restauran los datos PostgreSQL de BizCode mediante scripts del repositorio.

## Evidencia de producto (#150)

Narrativa operativa (trilingüe): [Copia de seguridad y restauración](../../quality/backup-y-restauracion.md).

| Elemento de control | Evidencia en el repo |
|---------------------|----------------------|
| Dump lógico | `npm run backup:postgres` → `pg_dump` vía Docker exec o CLI del host |
| Cifrado en reposo (artefacto) | AES-256-GCM con `BACKUP_ENCRYPTION_KEY` (`scripts/lib/postgres-backup/crypto.ts`) |
| Retención local | 7 diarios / 4 semanales / 3 mensuales (`prune-postgres-backups`) |
| Offsite opcional | `BIZCODE_BACKUP_S3_URI` + AWS CLI `aws s3 cp` (soft-fail) |
| Restore | `npm run backup:postgres:restore -- --file … --yes` |
| Alerta de fallo | Email soft-fail vía `SECURITY_ALERT_EMAILS` + SMTP si hay config |
| Programación | Cron `0 2 * * *` UTC (host ops; no es el pipeline default de GitHub Actions) |

## Checklist del operador

1. Asegurar Postgres/`pg_dump` alcanzable e inyectar `BACKUP_ENCRYPTION_KEY` (Doppler o secreto de host).
2. Ejecutar backup + prune nocturnos; verificar edad del artefacto &lt; 26 h.
3. Drill trimestral de restore a una base no productiva; registrar resultado en el change log de ops.
4. Drills staging/producción: bloqueados hasta que existan entornos [#152](https://github.com/ayelenleclerc/BizCode/issues/152).

## Historial de revisiones

| Versión | Fecha | Autor | Resumen de cambios |
|--------------|-----------|-------------|----------------|
| 0.2 | 2026-07-30 | BizCode | Evidencia de producto #150; enlace a narrativa quality |
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
