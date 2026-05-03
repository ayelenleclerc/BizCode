# ADR-0009: Dominio Pedido — solo diseño hasta BP1-1

**Estado:** Aceptado  
**Fecha:** 2026-05-03  
**Referencia ISO:** ISO/IEC 12207 (ciclo de vida diseño/implementación); ISO 9001:2015 cláusula 8.3 (diseño y desarrollo)

---

## Contexto

La documentación de calidad describe el flujo objetivo **pedido → entrega → cobranza** ([`docs/es/quality/flujo-operativo-pedido-entrega-cobranza.md`](../../quality/flujo-operativo-pedido-entrega-cobranza.md)). El RBAC ya define permisos `orders.*` en [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts). **No hay** modelo Prisma ni rutas REST públicas persistidas para un `Pedido` en el MVP documentado (`docs/api/openapi.yaml`).

El backlog **BP1-1** fija cuándo implementar persistencia y APIs.

## Decisión

1. Considerar el ciclo de **pedido** como **solo diseño** hasta ejecutar BP1-1 con plan de implementación y migraciones aprobados.
2. **No** añadir modelos Prisma ni rutas REST para `Pedido` en este entregable; mantener la narrativa de diseño en el documento operativo anterior y equivalentes EN/PT-BR.
3. Al iniciar BP1-1: alinear Prisma y OpenAPI con los estados y RACI del documento operativo y conectar **`orders.*`** a handlers reales (con auditoría coherente con `#84`).
4. **Ámbito de canal:** la cabecera opcional `x-bizcode-channel` ([`docs/api/openapi.yaml`](../../api/openapi.yaml), [`server/auth.ts`](../../../../server/auth.ts)) permanece ortogonal; las futuras APIs de pedidos deberán respetar `claims.scope.channels`.

## Consecuencias

- **Pros:** Sin esquema especulativo ni endpoints no documentados; contrato y pruebas reflejan el código real.
- **Contras:** Los flujos “pedido” siguen fuera del sistema hasta BP1-1.

## Referencias

- [`docs/es/quality/flujo-operativo-pedido-entrega-cobranza.md`](../../quality/flujo-operativo-pedido-entrega-cobranza.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
