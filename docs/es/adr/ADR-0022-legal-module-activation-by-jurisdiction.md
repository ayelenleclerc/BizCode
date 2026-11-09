# ADR-0022: Activación de módulos legales por jurisdicción fiscal

**Estado:** Aceptado  
**Fecha:** 2026-08-31  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2 (diseño de software)

---

## Contexto

El issue [#207](https://github.com/ayelenleclerc/BizCode/issues/207) añadió jurisdicción fiscal por tenant (`TenantConfig.jurisdiccionFiscal`), que gobierna IVA, validación de identificador fiscal y selección de adaptador. El aprovisionamiento, sin embargo, seguía siendo argentino por construcción:

- Los cuatro módulos legales argentinos (`billing.arca_cae`, `finance.retenciones`, `fiscal.remito`, `fiscal.cheques`) forman parte de `DEFAULT_MODULES`, así que todo tenant nuevo los recibía con independencia de su jurisdicción.
- Ningún camino de alta escribía `jurisdiccionFiscal`; todos dependían del default `'AR'` de la columna.
- El registro SaaS público validaba CUIT y consultaba el padrón ARCA sin condicionar por país.
- El catálogo solo sabía dónde un módulo era **obligatorio** (`requiredInProdForCountries`), nunca dónde era **aplicable**.

La evidencia de que esos cuatro módulos son argentinos está en el código: `remitoPdf.ts` y las exportaciones SICORE/SIFERE viven bajo `apps/server/fiscal/ar/`, `billing.arca_cae` apunta a ARCA, y el modelo `Cheque` persiste `cbuOrigen`, `libradorCuit` y la modalidad `echeq`.

El issue [#437](https://github.com/ayelenleclerc/BizCode/issues/437) generaliza esto antes de sumar más países, para que cada jurisdicción nueva sea declarativa y no un nuevo conjunto de condicionales.

Opciones consideradas:

1. Añadir condicionales por país donde se usa cada módulo argentino — dispersa lógica fiscal en archivos no relacionados, lo que [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) punto 3 rechaza.
2. Inferir aplicabilidad desde `requiredInProdForCountries` — mezcla «obligatorio en producción» con «legalmente aplicable»; un módulo puede ser aplicable y opcional.
3. **Declarar aplicabilidad en el catálogo y resolver la jurisdicción de instalación desde el entorno del servidor** — elegida.

## Decisión

1. `ModuleDef.availableForCountries?: readonly string[]` declara dónde un módulo es legalmente aplicable. **Ausente significa aplicable en todas partes**, de modo que ningún módulo preexistente cambia de comportamiento; solo los cuatro argentinos se estrechan a `['AR']`.
2. El conjunto inicial de módulos de un tenant se deriva de su jurisdicción vía `getDefaultModulesForJurisdiction`. `NEW_TENANT_MODULES` es esa función aplicada a la jurisdicción por defecto, lo que preserva exactamente el conjunto argentino actual.
3. `validateModuleSet` rechaza un módulo no aplicable con `not_available_in_country:<code>`, y tanto el payload del catálogo como los presets omiten esos módulos para que la UI no los ofrezca.
4. La instalación declara sus jurisdicciones con dos variables de entorno del servidor, leídas por `resolveInstallationJurisdictions` en `apps/web/src/lib/modules/jurisdictionEnv.ts`, siguiendo el patrón de `resolveDeploymentEnv` — **solo entorno de servidor, nunca configuración del tenant**:
   - `BIZCODE_FISCAL_JURISDICTIONS`: jurisdicciones que ofrece esta instalación.
   - `BIZCODE_DEFAULT_JURISDICTION`: jurisdicción de tenants creados sin elección explícita.
   Sin definir, el comportamiento es el anterior a #437: todas las del catálogo habilitadas y default `AR`. El default resuelto siempre forma parte de la lista habilitada.
5. Todo camino de alta escribe `jurisdiccionFiscal` de forma explícita mediante `buildNewTenantFiscalDefaults`.
6. `upsertConfig` rechaza una jurisdicción fuera de la lista con `jurisdiction_not_enabled` en lugar de degradarla en silencio, y `applyPreset` recorta el preset a lo aplicable en la jurisdicción del tenant.
7. El formulario de registro público elige el país entre los habilitados (`GET /api/saas/jurisdictions`), valida el identificador fiscal con `validateTaxId` para esa jurisdicción, y la consulta al padrón ARCA solo corre para `AR`.

## Consecuencias

- **Positivo:** Sumar un país es declarativo — entrada de catálogo, validador, adaptador — sin nuevos condicionales en módulos no relacionados.
- **Positivo:** Una instalación de un solo país deja de ofrecer el resto, en registro público y selector de super-admin.
- **Positivo:** Sin migración de datos: `jurisdiccionFiscal` ya existe con default `'AR'`.
- **Negativo:** El aprovisionamiento depende de variables de entorno del servidor; un `BIZCODE_DEFAULT_JURISDICTION` mal configurado cambia los módulos de tenants nuevos. Mitigado por fallback al comportamiento previo si no están definidas o son inválidas.
- **No evidenciado:** Licenciamiento por jurisdicción (ADR-0007 menciona licencia como eje; solo hay configuración), e integración real contra organismos extranjeros — DGI, SII, SAT y NF-e siguen siendo stubs/mocks que fallan o simulan de forma explícita.

## Referencias

- Issue #437, Issue #207
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [activacion-modulos-legales-por-jurisdiccion.md](../quality/activacion-modulos-legales-por-jurisdiccion.md)
