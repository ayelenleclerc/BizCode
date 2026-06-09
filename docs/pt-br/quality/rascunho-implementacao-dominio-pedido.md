# Domínio Pedido — rascunho de implementação (BP1-1)

**Somente desenho.** Não implica migração nem rotas no repositório. Ao executar BP1-1, substituir por `schema.prisma` e `openapi.yaml` reais.

## Rascunho Prisma (indicativo)

Mesma estrutura da versão em inglês: ver [order-domain-implementation-sketch.md](../../en/quality/order-domain-implementation-sketch.md) secção «Prisma sketch» (comentários idênticos em inglês para manter nomes de enum alinhados).

## Rascunho OpenAPI (indicativo)

| Método | Caminho | Finalidade |
|--------|---------|--------------|
| `POST` | `/api/pedidos` | Criação em `draft` |
| `GET` | `/api/pedidos` | Lista (tenant, paginada) |
| `GET` | `/api/pedidos/:id` | Detalhe + itens |
| `PUT` | `/api/pedidos/:id` | Atualização conforme `estado` |
| `POST` | `/api/pedidos/:id/transitions` | Corpo `{ "to": "confirmed" \| ... }` com validação no servidor |
| `POST` | `/api/pedidos/:id/invoice` | Atalho opcional para `Factura` e estado `invoiced` |

Permissões `orders.*` e cabeçalho `x-bizcode-channel` conforme [ADR-0009](../adr/ADR-0009-entidade-pedido-apenas-design-ate-bp1-1.md).

## Moeda

**MVP padrão:** moeda única por tenant; sem multi-moeda no primeiro slice de BP1-1 salvo decisão de produto (ADR adicional).

## Referências

- [fluxo-operacional-pedido-entrega-cobranca.md](fluxo-operacional-pedido-entrega-cobranca.md)
- [ADR-0009](../adr/ADR-0009-entidade-pedido-apenas-design-ate-bp1-1.md)
