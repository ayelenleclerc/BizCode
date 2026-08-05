# ADR-0009: Dominio Pedido — diseño, MVP y ciclo BP1-1 completo

**Estado:** Aceptado (actualizado 2026-08-05: ciclo completo #391; MVP #132 + gating #223)  
**Fecha:** 2026-05-03  
**Referencia ISO:** ISO/IEC 12207; ISO 9001:2015 cláusula 8.3

---

## Contexto

Docs de calidad describen el ciclo **pedido → entrega → cobranza**. RBAC expone `orders.*`.

**MVP comercial (#132):** modelos y API con estados `draft|confirmed|invoiced|cancelled`.

**Gating (#223):** módulo `billing.orders`.

**BP1-1 completo (#391):** `packed|shipped|delivered|collected`; endpoints de transición; sync remito/OE → Pedido; cobro → `collected`. Diseño: #65 (cerrado).

## Decisión

1. `estado` como string validado (máquina en `pedidoStateMachine`); sin enum Prisma.
2. **Facturación temprana:** desde `confirmed` → `invoiced`; desde logística solo se setea `facturaId` sin perder progreso.
3. `collect` exige Factura liquidada; desde `invoiced` o `delivered`.
4. Cancel solo `draft|confirmed`.
5. Canal ortogonal.

## Consecuencias

Máquina Pedido unificada; OE/remito/cobros siguen siendo especialistas que sincronizan hacia Pedido.

## Moneda

Moneda por defecto del tenant. Multi-moneda → ADR aparte.

## Referencias

Versión EN canónica de detalle de paths: [ADR-0009-order-entity-design-only.md](../../en/adr/ADR-0009-order-entity-design-only.md). Issues #65, #132, #223, #391.
