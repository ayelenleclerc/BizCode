# ADR-0009: Domínio “Pedido” — design e recorte MVP comercial

**Status:** Aceito (atualizado 2026-05-18: recorte MVP #132 no código; gating modular #223)  
**Data:** 2026-05-03  
**Referência ISO:** ISO/IEC 12207 (ciclo de vida design/implementação); ISO 9001:2015 cláusula 8.3 (design e desenvolvimento)

---

## Contexto

A documentação de qualidade descreve o fluxo-alvo **pedido → entrega → cobrança** ([`docs/pt-br/quality/fluxo-operacional-pedido-entrega-cobranca.md`](../../quality/fluxo-operacional-pedido-entrega-cobranca.md)). O RBAC expõe permissões `orders.*` em [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts).

**Evidência no repositório (MVP #132):** modelos `Pedido` / `PedidoItem` em [`prisma/schema.prisma`](../../../../prisma/schema.prisma); rotas `GET/POST/PUT/DELETE /api/pedidos` e `POST .../confirm`, `POST .../invoice` em [`server/routes/registerPedidosRoutes.ts`](../../../../server/routes/registerPedidosRoutes.ts); contrato em [`docs/api/openapi.yaml`](../../api/openapi.yaml). Estados neste recorte: `draft`, `confirmed`, `invoiced`, `cancelled` (não o ciclo logístico completo `packed`…`collected` — backlog #65).

**Gating modular (#223):** pedidos exigem módulo `billing.orders` via `requireModule` e `TenantConfig` por tenant.

## Decisão

1. **Recorte comercial BP1-1 (#132):** persistir `Pedido` + `PedidoItem` e expor APIs no OpenAPI com auditoria `pedido_*`.
2. **Pendente (#65 / BP1-1 completo):** estados logísticos e vínculo pedido→entrega→cobrança conforme o documento operacional.
3. Manter o documento operacional e equivalentes EN/ES como referência do ciclo-alvo.
4. **Escopo por canal:** `x-bizcode-channel` permanece ortogonal; APIs de pedidos respeitam `claims.scope.channels`.

## Consequências

- **Prós:** Contrato, testes e docs alinhados ao MVP comercial; gating por tenant sem Redis (cache em processo, #223).
- **Contras:** O fluxo completo do diagrama permanece parcial até #65.

## Alternativas consideradas (#69)

Resumo na versão EN: [ADR-0009-order-entity-design-only.md](../../en/adr/ADR-0009-order-entity-design-only.md) (*Alternatives considered*). Decisão: `Pedido` + `PedidoItem` relacionais com enum de estados (`draft` … `collected`).

## Moeda e chaves de estado

Moeda **padrão do tenant** no primeiro slice; multi-moeda em ADR separado se necessário. Mapeamento diagrama → chaves: secção *Estados canônicos de implementação* em [fluxo-operacional-pedido-entrega-cobranca.md](../../quality/fluxo-operacional-pedido-entrega-cobranca.md). Rascunho Prisma/OpenAPI: [rascunho-implementacao-dominio-pedido.md](../../quality/rascunho-implementacao-dominio-pedido.md).

## Referências

- [`docs/pt-br/quality/fluxo-operacional-pedido-entrega-cobranca.md`](../../quality/fluxo-operacional-pedido-entrega-cobranca.md)
- [`docs/pt-br/quality/rascunho-implementacao-dominio-pedido.md`](../../quality/rascunho-implementacao-dominio-pedido.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
