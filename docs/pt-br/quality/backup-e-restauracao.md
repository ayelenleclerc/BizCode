# Backup e restauração PostgreSQL (#150)

## Propósito

Descreve o pipeline de backup automático de PostgreSQL no repositório: `pg_dump` lógico, gzip, criptografia AES-256-GCM, retenção local (7 diários / 4 semanais / 3 mensais), upload opcional S3/R2 via AWS CLI e restauração verificável. Complementa ISO [SEC-007](../certificacion-iso/sec/sec-007-backup-restauracao.md).

**Estado de evidência:** Implementado nos scripts de produto (verificado contra Docker local `:5432` no host de desenvolvimento). O drill de restore em staging/produção permanece passo operacional quando existirem hosts remotos de [#152](https://github.com/ayelenleclerc/BizCode/issues/152) / [entornos-implantacao.md](entornos-implantacao.md). Não é afirmação de certificação.

## Componentes (evidência)

| Peça | Caminho / comando |
|------|-------------------|
| Job de backup | [`scripts/backup-postgres.ts`](../../../scripts/backup-postgres.ts) — `npm run backup:postgres` |
| Restore | [`scripts/restore-postgres.ts`](../../../scripts/restore-postgres.ts) — `npm run backup:postgres:restore -- --list` / `--file … --yes` |
| Drill de integridade isolado (#449) | [`scripts/postgres-backup-restore-drill.ts`](../../../scripts/postgres-backup-restore-drill.ts) — `npm run backup:postgres:drill` |
| Prune | [`scripts/prune-postgres-backups.ts`](../../../scripts/prune-postgres-backups.ts) — `npm run backup:postgres:prune` |
| Crypto / retenção | [`scripts/lib/postgres-backup/`](../../../scripts/lib/postgres-backup/) |
| Wrappers cron (Linux) | `scripts/backup-postgres.sh`, `restore-postgres.sh`, `prune-postgres-backups.sh` |
| Testes unitários | [`tests/scripts/postgres-backup.test.ts`](../../../tests/scripts/postgres-backup.test.ts) |

## Agendamento

| Horário (UTC) | Comando | Notas |
|---------------|---------|-------|
| `0 2 * * *` | `npm run backup:postgres` e depois `npm run backup:postgres:prune` | Janela noturna recomendada |
| Monitoramento | Alertar se não houver artefato bem-sucedido mais recente que **26 horas** | Check ops; email opcional `SECURITY_ALERT_EMAILS` em falha |

## Variáveis de ambiente

Documentadas em [`.env.example`](../../../.env.example):

| Variável | Papel |
|----------|-------|
| `BACKUP_ENCRYPTION_KEY` | **Obrigatória.** Passphrase → SHA-256 → chave AES-256-GCM. Nunca commit nem logs. |
| `BIZCODE_BACKUP_DIR` | Destino local (default `.bizcode-backups/`, gitignored). |
| `BIZCODE_BACKUP_S3_URI` | Prefixo `s3://…` opcional; upload com `aws s3 cp` (soft-fail sem CLI/creds). |
| `BIZCODE_POSTGRES_CONTAINER` | Container Docker (default `bizcode_db`). |
| `BIZCODE_POSTGRES_USER` / `BIZCODE_POSTGRES_DB` | Defaults `postgres` / `bizcode_dev`. |
| `BIZCODE_BACKUP_USE_DOCKER` | Default `true` (preferir `docker exec` no Windows). `false` usa `pg_dump`/`psql` do host. |
| `SECURITY_ALERT_EMAILS` + SMTP | Email soft-fail se o backup falhar. |

Postgres local: [`docker-compose.postgres.yml`](../../../docker-compose.postgres.yml) (`5432:5432`, DB `bizcode_dev`) ou container equivalente em `:5432`.

## Formato do artefato

- Nome: `bizcode-pg-<db>-<YYYYMMDDTHHMMSSZ>.sql.gz.enc`
- Payload: magic `BCBK1` + IV (12) + tag GCM (16) + ciphertext de gzip(dump SQL)

## Restauração (destrutiva)

1. Listar: `npm run backup:postgres:restore -- --list`
2. Restore exige `--yes` explícito:

```bash
npm run backup:postgres:restore -- --file .bizcode-backups/<file>.sql.gz.enc --yes
npm run backup:postgres:restore -- --file .bizcode-backups/<file>.sql.gz.enc --db bizcode_restore_test --yes
```

Preferir base dedicada para drills. Não apontar para produção sem janela de mudança aprovada.

## Drill isolado do piloto (#449)

Backup → restore → verificação de contagens em um banco **lateral** (nunca produção):

```bash
export BACKUP_ENCRYPTION_KEY='…efêmera…'
export BIZCODE_POSTGRES_CONTAINER='bizcode-postgres-1'
export BIZCODE_POSTGRES_DB='bizcode_dev'
npm run backup:postgres:drill
```

O drill cria `bizcode_restore_drill_449`, restaura, compara contagens de tabelas críticas (`Tenant`, `AppUser`, `Cliente`, `Factura`, ledger de pagamentos se existirem) e remove o banco lateral. O resumo JSON não deve incluir segredos. Registrar evidência em [SEC-015](../certificacion-iso/sec/sec-015-evidencias-teste-restauracao.md).

**Job vs implantação:** scripts e cron em [ciclo-ci-cd.md](ciclo-ci-cd.md) implementam o **job**. Provisionamento do host, cron ao vivo e DR de staging continuam operacionais (#152 / [recuperacao-de-desastres.md](recuperacao-de-desastres.md)); este drill **não** fecha o AC de staging de #197.

**RPO/RTO propostos para o piloto (mesmos alvos de #197):** RPO &lt; 24 h; RTO &lt; 4 h. Não há réplica/failover automático evidenciado no repositório.

## Política de armazenamento remoto

- O **diretório local** cumpre o DoD desta entrega.
- Upload **S3/R2** é opcional via AWS CLI; retenção remota é do operador.
- **Restic** fica como alternativa futura (não incluído nesta PR).

## Fora de escopo (esta entrega)

- Integração Restic
- Cliente `@aws-sdk` no app Node
- Provisionamento staging/produção (residual de [#152](https://github.com/ayelenleclerc/BizCode/issues/152); ver [entornos-implantacao.md](entornos-implantacao.md))
- Mudanças mobile / Mercado Pago / ARCA

## Relacionado

- [SEC-007 Procedimento de backup e restauração](../certificacion-iso/sec/sec-007-backup-restauracao.md)
- [Recuperação de desastres (#197)](recuperacao-de-desastres.md)
- [SLA (#197)](sla.md)
- [CI/CD — jobs agendados](ciclo-ci-cd.md)
- [Política de sanitização de logs](politica-sanitizacao-logs.md)
- [Gestão de segredos / Doppler](gestao-segredos-e-doppler.md)
