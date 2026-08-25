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
| Uptime mensal | 99.9% (~43.8 min/mês) | Monitor HTTP(S) em `/api/health` + status page | **Não evidenciado** — ativação pendente |
| API P95 | &lt; 500 ms | Métricas do app (#151) | Parcial |
| Primeira resposta suporte | P1 &lt; 4 h úteis; P2 &lt; 24 h | Tickets (operador) | **Não evidenciado** |
| RTO | &lt; 4 h | Drill de restore | Smoke local: [SEC-015](../certificacion-iso/sec/sec-015-evidencias-teste-restauracao.md); staging **pendente** |
| RPO | &lt; 24 h | Backup diário | Parcial — [backup-e-restauracao.md](backup-e-restauracao.md) |

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
2. Status page pública.  
3. Registrar URLs nos contatos de emergência.  
4. Não afirmar “monitoramento público ativo” até 1–3.

## Relacionado

- [Recuperação de desastres](recuperacao-de-desastres.md)
- [Ambientes de implantação](entornos-implantacao.md)
- [SRV-003](../certificacion-iso/srv/srv-003-catalogo-sla.md)

## Outros idiomas

- English: [sla.md](../../en/quality/sla.md)
- Español: [sla.md](../../es/quality/sla.md)

## Histórico

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-08-25 | BizCode | Modelo SLA inicial #197 |
