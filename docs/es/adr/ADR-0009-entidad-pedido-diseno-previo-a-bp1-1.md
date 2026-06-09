# ADR-0009: Dominio Pedido — diseño y slice MVP comercial

**Estado:** Aceptado (actualizado 2026-05-18: slice MVP #132 en código; gating modular #223)  
**Fecha:** 2026-05-03  
**Referencia ISO:** ISO/IEC 12207 (ciclo de vida diseño/implementación); ISO 9001:2015 cláusula 8.3 (diseño y desarrollo)

---

## Contexto

La documentación de calidad describe el flujo objetivo **pedido → entrega → cobranza** ([`docs/es/quality/flujo-operativo-pedido-entrega-cobranza.md`](../../quality/flujo-operativo-pedido-entrega-cobranza.md)). El RBAC define permisos `orders.*` en [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts).

**Evidencia en repositorio (MVP #132):** modelos `Pedido` / `PedidoItem` en [`prisma/schema.prisma`](../../../../prisma/schema.prisma); rutas `GET/POST/PUT/DELETE /api/pedidos` y transiciones `POST .../confirm`, `POST .../invoice` en [`server/routes/registerPedidosRoutes.ts`](../../../../server/routes/registerPedidosRoutes.ts); contrato en [`docs/api/openapi.yaml`](../../api/openapi.yaml). Estados implementados en este slice: `draft`, `confirmed`, `invoiced`, `cancelled` (no el ciclo logístico completo `packed`…`collected` del diagrama — backlog #65).

**Gating modular (#223):** acceso a pedidos exige módulo `billing.orders` vía `requireModule` y configuración por tenant (`TenantConfig`).

## Decisión

1. **Slice comercial BP1-1 (#132):** persistir `Pedido` + `PedidoItem` y exponer APIs documentadas en OpenAPI con los estados del slice anterior y auditoría `pedido_*`.
2. **Pendiente (#65 / BP1-1 completo):** estados y transiciones logísticas (`packed`…`collected`) y vínculo pedido→entrega→cobranza según el documento operativo.
3. Mantener la narrativa de diseño en el documento operativo y equivalentes EN/PT-BR como referencia del ciclo objetivo.
4. **Ámbito de canal:** la cabecera opcional `x-bizcode-channel` permanece ortogonal; las APIs de pedidos respetan `claims.scope.channels` como el resto de rutas autenticadas.

## Consecuencias

- **Pros:** Contrato, pruebas y docs alineados al código del MVP comercial; gating por tenant sin Redis (caché en proceso, #223).
- **Contras:** El flujo operativo completo del diagrama sigue parcial hasta #65.

## Alternativas consideradas (#69)

Tabla resumida en la versión EN del ADR: [ADR-0009-order-entity-design-only.md](../../en/adr/ADR-0009-order-entity-design-only.md) (sección *Alternatives considered*). Decisión: modelo relacional `Pedido` + `PedidoItem` con enum de estados (`draft` … `collected`).

## Moneda y claves de estado

**Moneda por tenant** en el primer slice; multi-moneda en ADR aparte si producto lo exige. Mapeo diagrama → claves de implementación: sección *Estados canónicos de implementación* en [flujo-operativo-pedido-entrega-cobranza.md](../../quality/flujo-operativo-pedido-entrega-cobranza.md). Boceto Prisma/OpenAPI: [boceto-implementacion-dominio-pedido.md](../../quality/boceto-implementacion-dominio-pedido.md).

## Referencias

- [`docs/es/quality/flujo-operativo-pedido-entrega-cobranza.md`](../../quality/flujo-operativo-pedido-entrega-cobranza.md)
- [`docs/es/quality/boceto-implementacion-dominio-pedido.md`](../../quality/boceto-implementacion-dominio-pedido.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
