# Conjuntos de reglas fiscales por país (#440)

## Propósito

El núcleo de BizCode no debe cablear códigos fiscales argentinos (`RI`, `CF`, letras `A/B/C`, CUIT/CBU, etiquetas 21%/10,5%). Cada jurisdicción declara su propio `FiscalRuleSet` en `packages/types/src/fiscal/`. Véase [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).

## Qué declara cada país

| Aspecto | Fuente |
| --- | --- |
| Algoritmo y ejemplo del identificador fiscal | `taxId` |
| Identificador bancario (o ninguno) | `bankAccount` (`null` si no hay evidencia) |
| Condiciones del sujeto + quién paga IVA | `subjectTaxConditions` (`paysVat`) |
| Códigos de IVA de artículo `1`/`2`/`3` | `vatRateCodes` |
| Letras de comprobante | `documentKinds` o `null` |
| Buckets IVA estándar/reducido | `vatRates` |
| Proveedor fiscal por defecto | `providerCode` |

## Consumidores en runtime

- **Servidor:** `validateBodyForTenant` + fábricas de esquemas de cliente/proveedor.
- **Motor de factura:** `subjectPaysVat` en lugar de comparar con `CF`/`Exento`.
- **UI:** `apps/web/src/lib/fiscal/uiOptions.ts`; `NuevaFacturaForm` pasa la jurisdicción a `calculateInvoice`.
- **Gating:** `fiscal.libro_iva` (solo AR) para Libro IVA; `echeq` solo con `fiscal.cheques`.

## Límites de evidencia

Las condiciones fiscales de Uruguay y Chile son un **modelo de producto** (si el sujeto paga IVA). Los catálogos oficiales de DGI/SII no están en el repositorio y requieren revisión de un asesor fiscal local.

## Relacionados

- [#440](https://github.com/ayelenleclerc/BizCode/issues/440), [#207](https://github.com/ayelenleclerc/BizCode/issues/207), [#437](https://github.com/ayelenleclerc/BizCode/issues/437), [#208](https://github.com/ayelenleclerc/BizCode/issues/208)
- [Base fiscal multipaís](base-fiscal-multipais.md), [Activación de módulos legales](activacion-modulos-legales-por-jurisdiccion.md), [Chile](jurisdiccion-fiscal-chile.md)
