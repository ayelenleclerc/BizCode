# México como jurisdição fiscal (#210)

## Propósito

Adiciona o México (`MX`) ao registro de regras fiscais por país de [#440](https://github.com/ayelenleclerc/BizCode/issues/440). Ver [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md) e [ADR-0024](../../en/adr/ADR-0024-mexico-sat-cfdi-mock-pac.md).

## Regras declaradas

| Aspecto | Valor |
| --- | --- |
| Moeda | MXN |
| Identificador | RFC (moral 12 / física 13) com dígito verificador módulo 11 |
| Conta bancária | nenhuma evidenciada |
| IVA | padrão 16%; bucket reduzido 0% (alimentos e medicamentos) |
| Taxa fronteiriça 8% | residual — depende da localização do estabelecimento |
| Letras de comprovante | nenhuma |
| Provedor | `mexico_sat_pac` — **mock PAC de homologação** (ADR-0024); Facturama/Finkok live não evidenciado |
| Módulo | `billing.cfdi_sat` (`availableForCountries: ['MX']`) |
| Artigo | `Articulo.claveProdServ` (`c_ClaveProdServ`) |
| Catálogos | `SatCatalogEntry` + `GET /api/fiscal/sat/catalog` (subconjunto; seed `scripts/sat-catalog-seed.ts`) |
| Cancelamento | `POST /api/fiscal/documents/{id}/cancel` com motivos SAT 01–04 |

## Limites de evidência

- Os catálogos oficiais completos do SAT e contratos PAC **não** estão neste repositório; o seed é um subconjunto curado.
- As condições fiscais do sujeito são um modelo de produto (quem paga IVA).
- A timbragem live via PAC autorizado continua **sem evidência** — o mock gera UUIDs determinísticos para testes.

## Relacionados

- [#210](https://github.com/ayelenleclerc/BizCode/issues/210), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Conjuntos de regras fiscais por país](conjuntos-regras-fiscais-por-pais.md)
