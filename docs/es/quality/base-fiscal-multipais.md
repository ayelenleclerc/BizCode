# Base fiscal multi-país — jurisdicción, RUT, IVA y módulos (#207)

**Alcance:** jurisdicción fiscal del tenant (`AR` / `UY`) · **Default:** `AR`, que conserva el comportamiento histórico

MVP que elimina los supuestos argentinos cableados en la facturación para que un tenant pueda declarar el país en el que tributa. Parametriza las alícuotas de IVA, agrega el validador de RUT uruguayo, desacopla los módulos genéricos del módulo fiscal argentino y selecciona el adaptador fiscal por país.

## Alcance

### Implementado

| Capacidad | Evidencia |
|---|---|
| Jurisdicción fiscal del tenant | `TenantConfig.jurisdiccionFiscal` en [prisma/schema.prisma](../../../prisma/schema.prisma) |
| Catálogo declarativo de jurisdicciones | [packages/types/src/fiscal-jurisdictions.ts](../../../packages/types/src/fiscal-jurisdictions.ts) |
| Validador de RUT uruguayo | [apps/web/src/lib/validators/rut.ts](../../../apps/web/src/lib/validators/rut.ts) |
| Alícuotas de IVA por jurisdicción | `calculateInvoice` en [apps/web/src/lib/invoice.ts](../../../apps/web/src/lib/invoice.ts), `calculateIVA` en [apps/web/src/lib/validators.ts](../../../apps/web/src/lib/validators.ts) |
| Módulos genéricos independientes de ARCA | `billing.credit_notes`, `finance.ledger` y `finance.retenciones` en [packages/types/src/modules-catalog.ts](../../../packages/types/src/modules-catalog.ts) |
| Adaptador fiscal elegido por país | `resolveDefaultProvider` en [apps/server/fiscal/FiscalProviderConfigService.ts](../../../apps/server/fiscal/FiscalProviderConfigService.ts) |

### Fuera de alcance (residual)

- DGI (Uruguay) SOAP/REST live y certificados digitales — **no evidenciado**. El mock CFE de homologación está en `apps/server/fiscal/uy/` ([ADR-0025](../adr/ADR-0025-uruguay-dgi-cfe-mock.md)); módulo `billing.dgi_cfe`.
- El circuito CAE argentino no se toca y sigue siendo un mock local: `arcaWsfeMock.ts` calcula el CAE con aritmética y el cliente WSFE real continúa pendiente en #133.
- PAC live de CFDI México (Facturama/Finkok) sigue sin evidenciarse; `mexico_sat_pac` es mock de homologación ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)). Ver [jurisdiccion-fiscal-mexico.md](jurisdiccion-fiscal-mexico.md).

## Catálogo de jurisdicciones

`FISCAL_JURISDICTIONS` es dato declarativo puro, sin comportamiento propio:

| Código | Moneda | Identificador | IVA general | IVA reducido | Proveedor |
|---|---|---|---|---|---|
| `AR` | ARS | CUIT | 21% | 10,5% | `arca_wsfe` |
| `UY` | UYU | RUT | 22% | 10% | `uruguay_dgi` |

`resolveJurisdiction` estrecha cualquier valor persistido y cae a `AR`, de modo que un código desconocido o ausente nunca puede cambiar cómo se factura a un tenant existente.

## IVA

`calculateInvoice(items, clienteIva, jurisdiccion?)` lee las alícuotas del catálogo. El tercer argumento es opcional y por defecto es Argentina, así que todas las llamadas existentes siguen produciendo totales idénticos: ese invariante queda fijado por un test de regresión que compara `calculateInvoice(items, 'RI')` con `calculateInvoice(items, 'RI', 'AR')`.

La estructura de columnas `neto1`/`neto2`/`neto3` e `iva1`/`iva2` no cambia: `neto1` es el bucket de la alícuota general y `neto2` el de la reducida, sea cual sea el país. Por lo tanto **no hay migración de datos** en `Factura`.

Los totales calculados en el servidor leen la jurisdicción del tenant mediante `getTenantJurisdiction` ([apps/server/services/tenantJurisdiction.ts](../../../apps/server/services/tenantJurisdiction.ts)), que reutiliza la caché de configuración y es consumido por `PedidoService`, `OrdenTrabajoService` y `ContratoBillingService`.

## Validador de RUT

`validateRUT` acepta 12 dígitos con separadores opcionales y verifica el dígito verificador por módulo 11 sobre los 11 primeros con los pesos `4,3,6,7,8,9,2,3,4,5,6`. Un resto igual a 1 no tiene verificador válido y se rechaza.

La especificación de la DGI no forma parte de este repositorio: el algoritmo es la regla pública documentada y los vectores de prueba de [rut.test.ts](../../../apps/web/src/lib/validators/rut.test.ts) se derivan de él, no de datos de muestra oficiales. `validateTaxId(taxId, jurisdiction)` despacha entre CUIT y RUT.

## Catálogo de módulos

`billing.credit_notes`, `finance.ledger` y `finance.retenciones` dependían de `billing.arca_cae`, lo que convertía al módulo fiscal argentino en prerrequisito de las notas de crédito y de la cuenta corriente en cualquier parte del mundo. Ahora dependen de `core.invoicing`.

`ModuleDef.requiredInProdForCountries` reemplaza el `requiredInProd` global de `billing.arca_cae`: es obligatorio en producción solo para `AR`. `validateModuleSet(modules, env, jurisdiction?)` y `canDeactivate(key, env, jurisdiction?)` reciben la jurisdicción con default argentino.

Solo se eliminaron aristas de dependencia, nunca se añadieron, así que ningún conjunto de módulos válido antes de este cambio deja de serlo.

## Selección del adaptador fiscal

`resolveDefaultProvider` mantiene la fila `isDefault` como máxima precedencia. Cuando ninguna fila está marcada, ahora busca una configuración habilitada cuyo `countryCode` coincida con la jurisdicción del tenant, y solo cae a la fila legacy `TenantFiscalConfig` (que implica `arca_wsfe`) para tenants argentinos. Un tenant uruguayo con solo el stub configurado recibe `FiscalAdapterNotImplementedError` al autorizar, que es el resultado correcto.

## API e interfaz de usuario

`GET /api/me/features` y los endpoints de configuración de tenant de super-admin exponen `jurisdiccionFiscal`; omitirlo en `PUT /api/superadmin/tenants/{tenantId}/config` conserva el valor almacenado en lugar de devolver el tenant a Argentina. Contrato: [docs/api/openapi.yaml](../../api/openapi.yaml).

- Página de módulos de super-admin: selector de jurisdicción (`superadmin-jurisdiction-select`) que muestra las alícuotas que se aplicarán.
- `ClienteForm`, `ProveedorForm` y `EmpresaPage`: la etiqueta, el placeholder, la ayuda y la validación del identificador fiscal siguen a la jurisdicción, y el campo expone `data-tax-id-kind`.
- La consulta al Padrón A4 de AFIP al perder el foco se omite fuera de Argentina.

Todos los textos están traducidos en EN/ES/PT-BR.

## Pruebas

- [tests/lib/fiscal-jurisdictions.test.ts](../../../tests/lib/fiscal-jurisdictions.test.ts) — catálogo y fallbacks.
- [apps/web/src/lib/validators/rut.test.ts](../../../apps/web/src/lib/validators/rut.test.ts) — dígito verificador y casos borde.
- [apps/web/src/lib/invoice.test.ts](../../../apps/web/src/lib/invoice.test.ts) — regresión argentina y alícuotas uruguayas.
- [tests/lib/modules-catalog.test.ts](../../../tests/lib/modules-catalog.test.ts) — desacople y obligatoriedad por país.
- [tests/server/fiscal/fiscalProviderConfigService.test.ts](../../../tests/server/fiscal/fiscalProviderConfigService.test.ts) — selección de adaptador por país.
- [tests/server/services/tenantJurisdiction.test.ts](../../../tests/server/services/tenantJurisdiction.test.ts) — caché, lectura de base y fallback.

## Evolución posterior

Los códigos argentinos que quedaban cableados en el núcleo tras #207 se movieron al registro de reglas por país en [#440](https://github.com/ayelenleclerc/BizCode/issues/440) — véase [conjuntos-reglas-fiscales-por-pais.md](conjuntos-reglas-fiscales-por-pais.md) y [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).
