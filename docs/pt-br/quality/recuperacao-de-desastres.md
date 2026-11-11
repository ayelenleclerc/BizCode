# Recuperação de desastres — BizCode (#197)

**Papel:** Runbooks DR para BizCode hospedado (ISO-ready).  
**Issue:** [#197](https://github.com/ayelenleclerc/BizCode/issues/197)  
**Hub:** [docs/DISASTER_RECOVERY.md](../../DISASTER_RECOVERY.md)

Não afirma certificação nem drill staging concluído. Smoke local ≠ AC staging.

## Objetivos

| Objetivo | Meta | Notas |
|----------|------|-------|
| RTO | &lt; 4 h | Restaurar serviço após desastre declarado |
| RPO | &lt; 24 h | Backup noturno ([backup-e-restauracao.md](backup-e-restauracao.md)) |

**Não evidenciado:** réplica automática / failover. Recuperação = **restore a partir de backup** + redeploy.

## Contatos de emergência (modelo)

| Papel | Nome / equipe | Canal | Notas |
|-------|---------------|-------|-------|
| Incident commander | _(pendente)_ | | |
| Platform / DBA | _(pendente)_ | | |
| Suporte hosting | _(pendente)_ | | |
| Product owner | _(pendente)_ | | |
| Segurança | _(pendente)_ | | [resposta-a-incidentes.md](resposta-a-incidentes.md) |

## RACI

| Atividade | Eng | Ops | Product owner |
|-----------|-----|-----|---------------|
| Declarar desastre | C | R | A |
| Reiniciar containers | C | R | I |
| Backup / restore | C | R | I |
| Migração de provedor | C | R | A |
| Aviso a clientes | C | C | R |
| Contenção de segurança | R | C | A |

---

## Cenário 1 — Falha do servidor de aplicação

Compose com `restart: unless-stopped` + `healthcheck` ([`docker-compose.staging.yml`](../../../docker-compose.staging.yml)).

1. Revisar monitor/host.  
2. SSH ([entornos-implantacao.md](entornos-implantacao.md)).  
3. `docker compose … ps` / restart / `up -d`.  
4. Verificar `GET /api/health`.

## Cenário 2 — Falha de banco de dados

Scripts #150. **Sem** failover de réplica documentado.

1. Parar escritores.  
2. Restaurar: `npm run backup:postgres:restore -- --file … --db <restore_db> --yes`.  
3. Validar; apontar `DATABASE_URL`; subir API.  
4. Registrar RTO em [SEC-015](../certificacion-iso/sec/sec-015-evidencias-teste-restauracao.md).

**Limite:** restore lógico da BD completa — **não** granular por tabela automatizado.

## Cenário 3 — Falha total do provedor de hosting

1. Declarar desastre; avisar clientes.  
2. Provisionar host (DNS/TLS operador).  
3. Docker + segredos; restore offsite; migrações.  
4. DNS; health; login smoke. Praticar em staging.

## Cenário 4 — Exclusão acidental de dados

1. Parar escritas.  
2. Restore em BD lateral (`--db`); extrair dados com Eng.  
3. Ou rollback completo com aprovação.  
4. Documentar em SEC-015.

## Cenário 5 — Compromisso de segurança

1. [resposta-a-incidentes.md](resposta-a-incidentes.md).  
2. Rotacionar segredos.  
3. Rebuild; restore de backup **limpo**.  
4. Notificações; post-mortem.

## Reconciliação de evidência (#449 vs #197) — 2026-11-08

| Item | Evidência | Fecha o AC #197? |
|------|-----------|----------------|
| Drill de integridade local (`pnpm run backup:postgres:drill`) | Linha SEC-015 2026-11-07; [backup-e-restauracao.md](backup-e-restauracao.md) | **Não** |
| Drill DR staging / remoto | Host pendente (`STAGING_DEPLOY_*`) | **Obrigatório** — aberto |
| Status page first-party (`/status`) | No repo (`apps/web/src/pages/status/`) | **Parcial** — UI evidenciada; URL live + monitor externo pendentes |
| Monitor externo de uptime | [uptime-monitor-register.md](../../evidence/uptime-monitor-register.md) | **Obrigatório** — registro vazio |
| Contatos de emergência | Modelo | **Não** — preencher ops |

## Drill semestral staging — AC pendente

Checklist cronometrado (não marcar completo sem evidência de relógio de parede):

1. Confirmar host staging com `STAGING_DEPLOY_*` ([entornos-implantacao.md](entornos-implantacao.md)).
2. Registrar hora de início (UTC); snapshot/backup.
3. Simular falha (parar app/DB só no staging).
4. Restaurar do backup; redesploy; verificar `/api/health` e `/status`.
5. Registrar hora de fim; calcular RTO; comparar com &lt; 4 h.
6. Acrescentar linha SEC-015 com RTO medido.
7. **#197 permanece OPEN** até este drill **e** uma entrada live em [uptime-monitor-register.md](../../evidence/uptime-monitor-register.md).

Smoke Docker local / drill #449 em SEC-015 **não** fecha esse AC.

## Relacionado

- [SLA](sla.md)
- [Registro de monitor de uptime](../../evidence/uptime-monitor-register.md)
- [Backup e restauração](backup-e-restauracao.md)
- [SEC-014](../certificacion-iso/sec/sec-014-continuidade-recuperacao.md)

## Outros idiomas

- English: [disaster-recovery.md](../../en/quality/disaster-recovery.md)
- Español: [recuperacion-ante-desastres.md](../../es/quality/recuperacion-ante-desastres.md)

## Histórico

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-08-25 | BizCode | Runbooks DR iniciais #197 |
| 0.2 | 2026-11-08 | BizCode | Gaps explícitos #449 vs staging/status para #197 |
| 0.3 | 2026-11-11 | BizCode | `/status` first-party + checklist drill staging cronometrado; registro de monitor vazio |
