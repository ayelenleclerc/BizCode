# Procedimento de backup e restauração

| Código do documento | SEC-007 |
| Versão | 0.2 |
| Data | 2026-07-30 |
| Autor | BizCode |
| Nível de requisito | Altamente recomendado |
| Aplicabilidade normativa | ISO/IEC 27001:2022 |
| Estado de evidência | Parcial — scripts de produto evidenciados (#150); drills DR organizacionais pendentes de staging (#152) |

## Declaração de fora de escopo

Este documento descreve o tooling de backup/restore do produto BizCode. Não afirma certificação ISO/IEC 27001.


## Propósito

Definir como os dados PostgreSQL do BizCode são respaldados, cifrados, retidos e restaurados com scripts do repositório.

## Evidência de produto (#150)

Narrativa operacional (trilingue): [Backup e restauração](../../quality/backup-e-restauracao.md).

| Elemento de controle | Evidência no repo |
|----------------------|-------------------|
| Dump lógico | `npm run backup:postgres` → `pg_dump` via Docker exec ou CLI do host |
| Criptografia em repouso (artefato) | AES-256-GCM com `BACKUP_ENCRYPTION_KEY` (`scripts/lib/postgres-backup/crypto.ts`) |
| Retenção local | 7 diários / 4 semanais / 3 mensais (`prune-postgres-backups`) |
| Offsite opcional | `BIZCODE_BACKUP_S3_URI` + AWS CLI `aws s3 cp` (soft-fail) |
| Restore | `npm run backup:postgres:restore -- --file … --yes` |
| Alerta de falha | Email soft-fail via `SECURITY_ALERT_EMAILS` + SMTP se houver config |
| Agendamento | Cron `0 2 * * *` UTC (host ops; não é o pipeline default do GitHub Actions) |

## Checklist do operador

1. Garantir Postgres/`pg_dump` alcançável e injetar `BACKUP_ENCRYPTION_KEY` (Doppler ou segredo do host).
2. Executar backup + prune noturnos; verificar idade do artefato &lt; 26 h.
3. Drill trimestral de restore em base não produtiva; registrar resultado no change log de ops.
4. Drills staging/produção: bloqueados até existirem ambientes [#152](https://github.com/ayelenleclerc/BizCode/issues/152).

## Histórico de revisões

| Versão | Data | Autor | Resumo das mudanças |
|--------------|-----------|-------------|----------------|
| 0.2 | 2026-07-30 | BizCode | Evidência de produto #150; link para narrativa quality |
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
