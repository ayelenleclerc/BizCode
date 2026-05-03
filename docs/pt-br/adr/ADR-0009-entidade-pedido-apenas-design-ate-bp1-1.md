# ADR-0009: Domínio “Pedido” — apenas design até BP1-1

**Status:** Aceito  
**Data:** 2026-05-03  
**Referência ISO:** ISO/IEC 12207 (ciclo de vida design/implementação); ISO 9001:2015 cláusula 8.3 (design e desenvolvimento)

---

## Contexto

A documentação de qualidade descreve o fluxo-alvo **pedido → entrega → cobrança** ([`docs/pt-br/quality/fluxo-operacional-pedido-entrega-cobranca.md`](../../quality/fluxo-operacional-pedido-entrega-cobranca.md)). O RBAC já expõe permissões `orders.*` em [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts). **Não há** modelo Prisma nem endpoints REST públicos persistindo `Pedido` no MVP atual (`docs/api/openapi.yaml`).

O backlog **BP1-1** define quando implementar persistência e APIs.

## Decisão

1. Tratar o ciclo de **pedido** como **apenas design** até a execução de BP1-1 com plano de implementação + migrações aprovadas.
2. **Não** adicionar modelos Prisma ou rotas REST de `Pedido` neste recorte de backlog; manter o desenho canônico no documento operacional acima e equivalentes EN/ES.
3. Ao iniciar BP1-1: alinhar schema e OpenAPI aos estados e ao mapa RACI do documento, e ligar **`orders.*`** a handlers reais (com auditoria alinhada a `#84`).
4. **Escopo por canal:** o cabeçalho opcional `x-bizcode-channel` ([`docs/api/openapi.yaml`](../../api/openapi.yaml), [`server/auth.ts`](../../../../server/auth.ts)) permanece ortogonal; rotas futuras de pedidos devem respeitar `claims.scope.channels`.

## Consequências

- **Prós:** Sem schema especulativo; contrato de API e testes permanecem fiéis ao código.
- **Contras:** Operações formais de pedido ficam de fora do sistema até BP1-1.

## Alternativas consideradas (#69)

Resumo na versão EN: [ADR-0009-order-entity-design-only.md](../../en/adr/ADR-0009-order-entity-design-only.md) (*Alternatives considered*). Decisão: `Pedido` + `PedidoItem` relacionais com enum de estados (`draft` … `collected`).

## Moeda e chaves de estado

Moeda **padrão do tenant** no primeiro slice; multi-moeda em ADR separado se necessário. Mapeamento diagrama → chaves: secção *Estados canônicos de implementação* em [fluxo-operacional-pedido-entrega-cobranca.md](../../quality/fluxo-operacional-pedido-entrega-cobranca.md). Rascunho Prisma/OpenAPI: [rascunho-implementacao-dominio-pedido.md](../../quality/rascunho-implementacao-dominio-pedido.md).

## Referências

- [`docs/pt-br/quality/fluxo-operacional-pedido-entrega-cobranca.md`](../../quality/fluxo-operacional-pedido-entrega-cobranca.md)
- [`docs/pt-br/quality/rascunho-implementacao-dominio-pedido.md`](../../quality/rascunho-implementacao-dominio-pedido.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
