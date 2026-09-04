# México como jurisdicción fiscal (#210)

## Propósito

Suma México (`MX`) al registro de reglas fiscales por país de [#440](https://github.com/ayelenleclerc/BizCode/issues/440). Véase [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md) y [ADR-0024](../../en/adr/ADR-0024-mexico-sat-cfdi-mock-pac.md).

## Reglas declaradas

| Aspecto | Valor |
| --- | --- |
| Moneda | MXN |
| Identificador | RFC (moral 12 / física 13) con dígito verificador módulo 11 |
| Cuenta bancaria | ninguna evidenciada |
| IVA | estándar 16%; bucket reducido 0% (alimentos y medicinas) |
| Tasa fronteriza 8% | residual — depende de la ubicación del establecimiento |
| Letras de comprobante | ninguna |
| Proveedor | `mexico_sat_pac` — **mock PAC de homologación** (ADR-0024); Facturama/Finkok live no evidenciado |
| Módulo | `billing.cfdi_sat` (`availableForCountries: ['MX']`) |
| Artículo | `Articulo.claveProdServ` (`c_ClaveProdServ`) |
| Catálogos | `SatCatalogEntry` + `GET /api/fiscal/sat/catalog` (subconjunto; seed `scripts/sat-catalog-seed.ts`) |
| Cancelación | `POST /api/fiscal/documents/{id}/cancel` con motivos SAT 01–04 |

## Límites de evidencia

- Los catálogos oficiales completos del SAT y los contratos con PAC **no** están en este repositorio; el seed es un subconjunto curado.
- Las condiciones fiscales del sujeto son un modelo de producto (quién paga IVA).
- El timbrado live vía PAC autorizado sigue **sin evidencia** — el mock genera UUID deterministas para pruebas.

## Relacionados

- [#210](https://github.com/ayelenleclerc/BizCode/issues/210), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Conjuntos de reglas fiscales por país](conjuntos-reglas-fiscales-por-pais.md)
