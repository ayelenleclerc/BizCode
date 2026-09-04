# Activación de módulos legales por jurisdicción fiscal (#437)

**Alcance:** cómo decide BizCode qué módulos legales puede usar un tenant, y cómo una instalación declara los países que atiende.

**Relacionado:** [ADR-0022](../../en/adr/ADR-0022-legal-module-activation-by-jurisdiction.md) · [ADR-0007](../../en/adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) · [base-fiscal-multipais.md](base-fiscal-multipais.md)

---

## Tres decisiones independientes

| Decisión | Dónde vive | Quién la fija |
|---|---|---|
| Qué países atiende esta instalación | `BIZCODE_FISCAL_JURISDICTIONS`, `BIZCODE_DEFAULT_JURISDICTION` (entorno del servidor) | Quien despliega la instalación |
| En qué país tributa un tenant | `TenantConfig.jurisdiccionFiscal` | El formulario de registro, o super-admin |
| Qué módulos puede activar ese tenant | `ModuleDef.availableForCountries` (catálogo) | El catálogo, por módulo |

La jurisdicción se lee solo del entorno del servidor, nunca de la configuración del tenant, siguiendo la misma regla que `resolveDeploymentEnv`.

## Declarar la aplicabilidad en el catálogo

`ModuleDef.availableForCountries` lista las jurisdicciones donde un módulo es legalmente aplicable. **Omitirlo significa que el módulo aplica en todas partes**, así que declarar la propiedad es lo que lo restringe:

```ts
'billing.arca_cae': {
  label: 'ARCA CAE',
  required: false,
  requiredInProd: false,
  requiredInProdForCountries: ['AR'],
  availableForCountries: ['AR'],
  dependencies: ['core.invoicing'],
  plan: 'starter',
  price: 0,
},
```

Hoy hay cuatro módulos restringidos a `['AR']`: `billing.arca_cae`, `finance.retenciones`, `fiscal.remito` y `fiscal.cheques`.

Nótese la diferencia con `requiredInProdForCountries`, introducido en #207: aquel indica dónde un módulo es **obligatorio en producción**, este indica dónde es **aplicable siquiera**. Un módulo puede ser aplicable y aun así opcional.

### Qué impone la aplicabilidad

- `getDefaultModulesForJurisdiction(code)` filtra `DEFAULT_MODULES`, de modo que un tenant que tributa fuera de Argentina no arranca con los módulos argentinos.
- `validateModuleSet` devuelve `not_available_in_country:<code>` cuando hay activo un módulo no aplicable.
- `buildModuleCatalogPayload` omite esos módulos, y recorta los presets, para que la UI de super-admin no los ofrezca.
- Un módulo no aplicable nunca se considera obligatorio, así que la validación de producción no exige un módulo que el tenant no puede usar.

## Declarar las jurisdicciones de una instalación

```bash
# Jurisdicciones que ofrece esta instalación. Sin definir: todas las del catálogo.
BIZCODE_FISCAL_JURISDICTIONS=AR,UY
# Jurisdicción de los tenants creados sin elección explícita. Sin definir: AR.
BIZCODE_DEFAULT_JURISDICTION=AR
```

`resolveInstallationJurisdictions` (`apps/web/src/lib/modules/jurisdictionEnv.ts`) aplica estas reglas:

- Los valores se recortan, se pasan a mayúsculas y se deduplican; los códigos desconocidos se ignoran.
- Si no sobrevive nada válido, se habilitan todas las jurisdicciones del catálogo: el comportamiento previo a #437.
- Un default explícito siempre se fuerza dentro de las habilitadas; cuando `AR` no está habilitada, el default pasa a ser la primera habilitada. El default resuelto, por lo tanto, siempre está habilitado.

Los códigos soportados provienen de `FISCAL_JURISDICTION_CODES`: `AR`, `UY`.

## Efecto en el alta de tenants

Todos los caminos que crean un tenant escriben `jurisdiccionFiscal` explícitamente mediante `buildNewTenantFiscalDefaults` (`apps/server/services/tenantProvisioningDefaults.ts`), en lugar de depender del default `'AR'` de la columna:

| Camino | Archivo |
|---|---|
| Registro SaaS público | `apps/server/saas/SaasOnboardingService.ts` |
| Alta del primer owner | `apps/server/auth.ts` (`setup-owner`) |
| Alta desde super-admin | `apps/server/services/SuperadminTenantService.ts` |
| Configuración creada por demanda | `apps/server/services/TenantConfigService.ts`, `apps/server/services/SellerAlertService.ts` |
| Seeds | `prisma/seedSuperAdmin.ts`, `scripts/seed-staging.ts` |

## Efecto en las interfaces

- **Registro público** (`apps/web/src/pages/saas/RegistroPage.tsx`): selector de país alimentado por `GET /api/saas/jurisdictions`, oculto cuando la instalación ofrece una sola jurisdicción. La etiqueta del identificador fiscal sigue al `taxIdKind` de la jurisdicción y el campo lleva `data-tax-id-kind`.
- **Backend de registro:** valida con `validateTaxId` para la jurisdicción elegida, rechaza una deshabilitada con `JURISDICTION_NOT_ENABLED` y consulta el padrón de ARCA solo para `AR`.
- **Super-admin** (`TenantModulesPage.tsx`): el selector de jurisdicción ofrece las habilitadas, más el valor actual del tenant para no reescribir en silencio una configuración existente. `GET /api/me/features` las informa en `jurisdiccionesHabilitadas`.
- **`upsertConfig`:** rechaza una jurisdicción deshabilitada con `jurisdiction_not_enabled`; `applyPreset` recorta el preset a lo aplicable.

## Fuera de alcance

No se implementa ninguna presentación real ante un organismo fiscal. DGI (Uruguay), SII (Chile) y NF-e (Brasil) siguen siendo stubs que fallan de forma explícita. CFDI México usa un mock PAC de homologación ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)); clientes PAC comerciales live no están evidenciados. El licenciamiento por jurisdicción, mencionado como eje de activación en ADR-0007, no está implementado: la activación es solo por configuración.

## Evidencia

| Aspecto | Prueba |
|---|---|
| Aplicabilidad del catálogo, defaults derivados, rechazo y filtrado del payload | `tests/lib/modules-availability.test.ts` |
| Resolución del entorno y sus fallbacks | `tests/lib/jurisdictionEnv.test.ts` |
| Registro por jurisdicción | `tests/server/saasOnboardingService.test.ts` |

## Evolución posterior

El núcleo seguía asumiendo condiciones fiscales, CUIT/CBU y letras argentinas hasta [#440](https://github.com/ayelenleclerc/BizCode/issues/440) — véase [conjuntos-reglas-fiscales-por-pais.md](conjuntos-reglas-fiscales-por-pais.md) y [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).
