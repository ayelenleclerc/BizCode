# ADR-0009: Domínio Pedido — design, MVP e ciclo BP1-1 completo

**Status:** Aceito (atualizado 2026-08-05: ciclo completo #391; MVP #132 + gating #223)  
**Data:** 2026-05-03  
**Referência ISO:** ISO/IEC 12207; ISO 9001:2015 cláusula 8.3

---

## Contexto

Docs de qualidade descrevem o ciclo **pedido → entrega → cobrança**. RBAC expõe `orders.*`.

**MVP comercial (#132):** estados `draft|confirmed|invoiced|cancelled`.

**Gating (#223):** módulo `billing.orders`.

**BP1-1 completo (#391):** `packed|shipped|delivered|collected`; endpoints; sync remito/OE → Pedido; cobrança → `collected`. Design: #65 (fechado).

## Decisão

1. `estado` como string validado (`pedidoStateMachine`); sem enum Prisma.
2. **Faturação antecipada:** `confirmed` → `invoiced`; na logística só define `facturaId` sem perder progresso.
3. `collect` exige Fatura liquidada; de `invoiced` ou `delivered`.
4. Cancel só `draft|confirmed`.
5. Canal ortogonal.

## Consequências

Máquina Pedido unificada; OE/remito/cobranças sincronizam para Pedido.

## Moeda

Moeda padrão do tenant. Multi-moeda → ADR separado.

## Referências

Detalhe EN: [ADR-0009-order-entity-design-only.md](../../en/adr/ADR-0009-order-entity-design-only.md). Issues #65, #132, #223, #391.
