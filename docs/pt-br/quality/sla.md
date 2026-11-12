# Acordo de nível de serviço (SLA) — BizCode SaaS (#197)

**Papel:** Modelo contratual de SLA para BizCode hospedado (ISO-ready).  
**Issue:** [#197](https://github.com/ayelenleclerc/BizCode/issues/197)  
**Hub:** [docs/SLA.md](../../SLA.md)

Define **objetivos** de serviço para implantações **SaaS/hosted**. Desktop local fica fora do compromisso de uptime. Valores **não** são evidência de medição ao vivo até ativar monitoramento público.

**Aviso legal:** Cláusulas de penalidades/jurisdição são **modelo** orientado a AR; exigem revisão jurídica antes de assinar. Não é aconselhamento jurídico.

## Descrição do serviço

Software multi-tenant BizCode (API + UI web) conforme assinatura. Exclui falhas de terceiros (AFIP/ARCA, Mercado Pago, DNS/CDN fora do controle BizCode), salvo má configuração BizCode.

## Métricas-alvo

| Métrica | Alvo | Como medir (ops) | Estado de evidência |
|---------|------|------------------|---------------------|
| Uptime mensal | 99.9% (~43.8 min/mês) | Monitor HTTP(S) em `/api/health` + status page | **Parcial** — UI first-party `/status` no repo (lê `/api/health`); monitor externo + URL implantada **Não evidenciados** ([uptime-monitor-register.md](../../evidence/uptime-monitor-register.md) vazio) |
| API P95 | &lt; 500 ms | Métricas do app (#151) | Parcial |
| Primeira resposta suporte | P1 &lt; 4 h úteis; P2 &lt; 24 h | Tickets (operador) | **Não evidenciado** |
| RTO | &lt; 4 h | Drill de restore | Drill de integridade local #449 em [SEC-015](../certificacion-iso/sec/sec-015-evidencias-teste-restauracao.md) (2026-11-07); staging **pendente** — **não** fecha #197 |
| RPO | &lt; 24 h | Backup diário | Parcial — [backup-e-restauracao.md](backup-e-restauracao.md) (#150 / #449) |

### Reconciliação com #449 (2026-11-08)

| Afirmação | Status |
|-----------|--------|
| Drill local `backup:postgres:drill` + linha SEC-015 | **Evidenciado** (#449) |
| Drill DR staging / remoto | **Não evidenciado** — #197 permanece aberto; pré-condição `pnpm run dr:staging:check` fail-closed sem `STAGING_DEPLOY_*` |
| Status page first-party (`/status`) | **Evidenciado no repo** (`apps/web/src/pages/status/`) — não é monitor contratual live |
| Monitor externo + URL de status implantada | **Não evidenciado** — 99.9% permanece **aspiracional**; registro vazio |
| Contatos de emergência preenchidos | Apenas modelo em [recuperacao-de-desastres.md](recuperacao-de-desastres.md) |

Não apresentar 99.9% de uptime como operável em contratos até monitoramento externo live registrado em [uptime-monitor-register.md](../../evidence/uptime-monitor-register.md).

Horário útil padrão: seg–sex 09:00–18:00 America/Argentina/Buenos_Aires.

## Exclusões

Manutenção anunciada (≥48 h), força maior, erro do cliente/rede, falhas de terceiros, features beta, trials (salvo contrato).

## Créditos / penalidades (modelo)

| Uptime (mês) | Crédito (% da mensalidade) |
|--------------|----------------------------|
| 99.0% – &lt; 99.9% | 10% |
| 95.0% – &lt; 99.0% | 25% |
| &lt; 95.0% | 50% |

Único remédio neste modelo salvo MSA. Teto 50%/mês. Reclamação em 30 dias com evidência do monitor.

## Jurisdição (modelo)

Lei argentina; tribunais CABA salvo MSA. **Confirmar com assessoria jurídica.**

## Ativação de monitoramento público (checklist ops)

1. Monitor UptimeRobot (ou equiv.) em `GET https://<prod>/api/health` a cada 5 min.  
2. Expor a UI first-party em `https://<prod>/status` (e opcionalmente uma status page de terceiros).  
3. Registrar URLs em [uptime-monitor-register.md](../../evidence/uptime-monitor-register.md) e contatos de emergência.  
4. Não afirmar “monitoramento público ativo” até 1–3.

## Relacionado

- [Recuperação de desastres](recuperacao-de-desastres.md)
- [Registro de monitor de uptime](../../evidence/uptime-monitor-register.md)
- [Ambientes de implantação](entornos-implantacao.md)
- [SRV-003](../certificacion-iso/srv/srv-003-catalogo-sla.md)

## Outros idiomas

- English: [sla.md](../../en/quality/sla.md)
- Español: [sla.md](../../es/quality/sla.md)

## Histórico

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-08-25 | BizCode | Modelo SLA inicial #197 |
| 0.2 | 2026-11-08 | BizCode | Reconciliar evidência RTO/RPO com #449; gaps staging/status |
| 0.3 | 2026-11-11 | BizCode | Página `/status` first-party no repo; registro de monitor vazio; 99.9% ainda aspiracional |
