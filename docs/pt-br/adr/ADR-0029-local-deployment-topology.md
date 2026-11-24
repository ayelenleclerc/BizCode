# ADR-0029: Topologia de implantação BizCode Local (baseline um site)

- **Status:** Aceito (baseline evidenciado); escolha piloto multi-site **Pendente decisão da proprietária / Chris**
- **Data:** 2026-11-23
- **Issue:** [#537](https://github.com/ayelenleclerc/BizCode/issues/537)
- **Relacionado:** [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [ADR-0010](ADR-0010-multi-tenant-isolation.md), [topologia-implantacao-local.md](../quality/topologia-implantacao-local.md) (#537), [matriz-escopo-local-distribuidora.md](../quality/matriz-escopo-local-distribuidora.md) (#536)

## Contexto

BizCode Local para distribuidora (#535) precisa de topologia explícita: um estabelecimento com vários postos, opção multi-filial (até cinco sites) e relação de portal / seller / driver / e-commerce / webhooks com uma API local. ADR-0007 já escolhe **um monorepo** e modos **desktop + SaaS**. A visão de produto documenta multi-usuário em LAN. A arquitetura descreve Express como **sidecar** Tauri; `src-tauri` hoje só expõe `ping` e **não** inicia a API ([#539](https://github.com/ayelenleclerc/BizCode/issues/539)).

Prisma modela **um** PostgreSQL por implantação (`DATABASE_URL`), com multi-depósito (`Deposito`, incl. `tipo = sucursal`) e isolamento por tenant — **não** sync site-a-site. Outboxes offline móveis descarregam para uma API alcançável; webhooks de marketplace/pagamentos exigem `API_PUBLIC_URL` público.

## Decisão

1. **Baseline Local (um estabelecimento):** Um host **principal** executa **Express API + PostgreSQL**; postos adicionais são **clientes** contra essa API. Nenhum posto cria DB independente por padrão.
2. **Drift docs vs runtime:** sidecar Tauri é o empacotamento **alvo**; até #539, a operação Local inicia API/Postgres de forma explícita.
3. **Depósitos ≠ sites:** `Deposito.tipo = sucursal` e transferências (#236) são armazéns **na mesma DB**.
4. **Multi-site:** opções **A** (DB compartilhada) e **B** (DB local + sync) ficam para **decisão da proprietária**; sync distribuído **Not evidenced**.
5. **Canais remotos** permanecem no inventário de regressão; edge público ou caminho hosted conforme a escolha de topologia.
6. **Não** inventar sync multi-DB, eleição de líder nem replicação neste ADR.

## Consequências

- Positivo: modelo de um site claro; falhas e canais documentados; multi-site revisável.
- Negativo: piloto de cinco sites só após escolher A/B e entregar #538/#539/#540 (+ sync se B).
- Seguimento: issues filhas de sync **somente após** a decisão multi-site.

## Outros idiomas

Mesmo slug: [English](../../en/adr/ADR-0029-local-deployment-topology.md) · [Español](../../es/adr/ADR-0029-local-deployment-topology.md)
