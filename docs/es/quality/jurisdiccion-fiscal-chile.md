# Chile como jurisdicción fiscal (#208)

**Alcance:** jurisdicción `CL` sobre la base multi-país de [#207](base-fiscal-multipais.md) y la activación de módulos por país de [#437](activacion-modulos-legales-por-jurisdiccion.md) · **Default:** sin cambios, `AR`

Chile se agrega de forma declarativa: no se introdujo ningún condicional en el código de facturación, módulos o adaptadores. La generalización hecha en #437 es lo que lo hace posible.

## Alcance

### Implementado

| Capacidad | Evidencia |
|---|---|
| `CL` en el catálogo de jurisdicciones | `FISCAL_JURISDICTIONS` en [packages/types/src/fiscal-jurisdictions.ts](../../../packages/types/src/fiscal-jurisdictions.ts) |
| Validador de RUT chileno | [apps/web/src/lib/validators/rutCl.ts](../../../apps/web/src/lib/validators/rutCl.ts) |
| Selección de identificador fiscal por país | `TAX_ID_ALGORITHMS` en [apps/web/src/lib/validators.ts](../../../apps/web/src/lib/validators.ts) |
| Proveedor `chile_sii` | [apps/server/fiscal/types.ts](../../../apps/server/fiscal/types.ts), [bootstrapFiscalProviders.ts](../../../apps/server/fiscal/bootstrapFiscalProviders.ts), [fiscalProviderRegistry.ts](../../../apps/server/fiscal/fiscalProviderRegistry.ts) |
| Adaptador solo de capacidades | [apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts](../../../apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts) |

### Fuera de alcance (residual)

- Emitir un DTE ante el SII chileno. Requiere certificado digital y homologación con el organismo, igual que la e-factura DGI en #207. `ChileSiiFiscalAdapter` declara `implemented: false` y toda llamada operativa lanza `FiscalAdapterNotImplementedError`.

## Entrada del catálogo

| Código | Moneda | Identificador | IVA general | IVA reducido | Proveedor |
|---|---|---|---|---|---|
| `CL` | CLP | RUT | 19 % | 19 % | `chile_sii` |

Chile tiene una única alícuota de IVA. `VatRates` sigue exigiendo `standard` y `reduced` porque `Factura` persiste los buckets `neto1`/`neto2` e `iva1`/`iva2`, así que `reduced` se declara también en 19 %: una factura chilena reparte sus líneas entre ambos buckets pero los dos tributan igual, y no hace falta cambiar el esquema.

## Identificador fiscal

El RUT chileno comparte nombre con el uruguayo pero no su algoritmo: 7-8 dígitos de cuerpo, pesos cíclicos 2..7 aplicados de derecha a izquierda y un verificador que puede ser `K` (resto 10) o `0` (resto 11).

Por eso `TaxIdKind` sigue siendo `'cuit' | 'rut'`: es una etiqueta de interfaz, no un selector de algoritmo. `validateTaxId` y `formatTaxId` resuelven por **código de jurisdicción**, de modo que `UY` y `CL` muestran «RUT» pero ejecutan algoritmos distintos, y no hubo que migrar ninguna clave i18n.

Las etiquetas de interfaz siguen la misma regla. Las claves `form.taxId.*` se indexan por código de jurisdicción (`AR`, `UY`, `CL`) y no por tipo de identificador, porque una clave `rut` compartida mostraba a los tenants chilenos el ejemplo uruguayo `01-234567-8908`, que no valida como RUT chileno. La consulta al padrón también se omite por país y no por tipo de identificador.

La especificación del SII no forma parte de este repositorio: la regla implementada es la pública documentada y los vectores de prueba de [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) se derivan de ella, no de datos oficiales del SII.

## Módulos

Ningún módulo se marcó con `availableForCountries: ['CL']`. Los cuatro módulos legales argentinos (`billing.arca_cae`, `fiscal.remito`, `fiscal.cheques`, `finance.retenciones`) ya están restringidos a `AR` por #437, así que un tenant chileno se aprovisiona sin ellos y el catálogo de módulos no los ofrece. No hizo falta cambiar nada más.

## Adaptador fiscal

`resolveDefaultProvider` ya selecciona por jurisdicción del tenant, así que un tenant chileno resuelve a `chile_sii` cuando existe una fila de configuración. Como el adaptador es un stub, autorizar un documento falla de forma explícita en vez de fabricar un folio.

## Pruebas

- [tests/lib/fiscal-jurisdictions-chile.test.ts](../../../tests/lib/fiscal-jurisdictions-chile.test.ts) — entrada del catálogo, alícuotas vía `calculateInvoice`, identificador fiscal y módulos por defecto.
- [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) — verificador incluyendo los casos `K` y `0`, validación y formato.
- [tests/server/fiscal/stubs/fiscalStubs.test.ts](../../../tests/server/fiscal/stubs/fiscalStubs.test.ts) — el adaptador rechaza toda llamada operativa.
- [tests/server/fiscal/fiscalProviderRegistry.test.ts](../../../tests/server/fiscal/fiscalProviderRegistry.test.ts) — `chile_sii` queda registrado en el bootstrap.
