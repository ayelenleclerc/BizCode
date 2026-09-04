# México como jurisdicción fiscal (#210)

## Propósito

Suma México (`MX`) al registro de reglas fiscales por país de [#440](https://github.com/ayelenleclerc/BizCode/issues/440). Véase [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).

## Reglas declaradas

| Aspecto | Valor |
| --- | --- |
| Moneda | MXN |
| Identificador | RFC (moral 12 / física 13) con dígito verificador módulo 11 |
| Cuenta bancaria | ninguna evidenciada |
| IVA | estándar 16%; bucket reducido 0% (alimentos y medicinas) |
| Tasa fronteriza 8% | residual — depende de la ubicación del establecimiento |
| Letras de comprobante | ninguna |
| Proveedor | `mexico_sat_pac` (stub; timbrado CFDI 4.0 no implementado) |

## Límites de evidencia

- Los catálogos oficiales del SAT y los contratos con PAC **no** están en este repositorio.
- Las condiciones fiscales del sujeto son un modelo de producto (quién paga IVA).
- El timbrado real exige PAC autorizado y certificado digital — el adapter permanece sin implementar.

## Relacionados

- [#210](https://github.com/ayelenleclerc/BizCode/issues/210), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Conjuntos de reglas fiscales por país](conjuntos-reglas-fiscales-por-pais.md)
