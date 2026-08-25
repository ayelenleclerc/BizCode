# Previsão de demanda / reposição — Fase 1 (#198)

**Papel do documento:** Guia de qualidade do MVP de reposição por média móvel.  
**Issue:** [#198](https://github.com/ayelenleclerc/BizCode/issues/198)

Não afirma machine learning, Holt-Winters, Prophet nem seis meses de precisão em produção.

## Escopo (Fase 1)

| Item | Evidência no repositório |
|------|--------------------------|
| Unidades vendidas | `FacturaItem.cantidad` em faturas `estado='A'` |
| Estoque / segurança | `Articulo.stock`, `Articulo.minimo` |
| Lead time | `ProveedorArticulo` preferido → `Proveedor.plazoHabitual` |
| Matemática | [`replenishmentForecastMath.ts`](../../../apps/server/services/replenishmentForecastMath.ts) |
| Serviço | [`ReplenishmentForecastService.ts`](../../../apps/server/services/ReplenishmentForecastService.ts) |
| REST | `GET /api/articulos/:id/reposicion-forecast`, `GET /api/catalogo/reposicion`, `POST /api/catalogo/reposicion/orden-compra-sugerida` |
| UI | Seção na ficha + `/catalogo/reposicion` → prefill OC multi-linha |

## Algoritmo (resumo)

1. Soma unidades nas janelas 90 / 60 / 30 dias; prioriza a mais longa com vendas.
2. Se unidades na janela &lt; 30 → `insufficient_data`.
3. `velocidade = unidades / dias`; `diasRestantes = floor(stock / velocidade)`.
4. `qtySugerida = ceil(velocidade × leadTime + minimo)`.
5. Lista se `diasRestantes ≤ horizonte` (30) ou `stock ≤ minimo`.

Limiar de erro Fase 1: MAPE &lt; 20% em **fixture sintético** nos testes unitários.

## Permissões

- Leitura: `products.read` + módulo `logistics.purchases`
- OC sugerida: `suppliers.manage` + módulo `logistics.purchases`

## Fora de escopo / residual

- Holt-Winters / Prophet (fases posteriores de #198)
- Dataset beta real para MAPE em produção
- Fechamento de #198 se restarem AC de ops/beta

## Relacionado

- Ordens de compra: #135 (fechado)
- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
