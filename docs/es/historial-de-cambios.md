# Changelog

Todos los cambios notables de BizCode se documentan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
Versionado: [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Added

- **Visión de producto y gobernanza:** documento trilingüe [vision-producto-y-despliegue.md](quality/vision-producto-y-despliegue.md) (PROD-VISION-001) · [en](../en/quality/product-vision-and-deployment.md) · [pt-BR](../pt-br/quality/visao-produto-e-implantacao.md); [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (escritorio/SaaS + modularidad fiscal); fila en [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); [AGENTS.md](../../AGENTS.md) y [`.cursor/rules/product-vision.mdc`](../../.cursor/rules/product-vision.mdc); matriz [trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md); enlaces en arquitectura
- **Documentación (paquete ISO):** [Certificación-ISO/README.md](../../Certificación-ISO/README.md) como punto de entrada; manual del SGQ, matriz de trazabilidad ISO, plantillas de registros y ciclo de vida documental bajo `docs/{en,es,pt-br}/certificacion-iso/` (fuente única); [indice-paquete-iso.md](certificacion-iso/indice-paquete-iso.md) (ISO-PKG-001); stubs en [`docs/quality/`](../quality/); estrategia de pruebas / CI/CD / plan Swagger siguen en `docs/*/quality/`; **SBOM:** `@cyclonedx/cyclonedx-npm`, `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json) (SBOM-001), [`docs/evidence/README.md`](../evidence/README.md)
- **API:** **Swagger UI** en `http://localhost:3001/api-docs/` (`swagger-ui-express`, [`server/createApp.ts`](../../server/createApp.ts), OpenAPI desde [`openapi.yaml`](../api/openapi.yaml)); [`tests/api/swagger-ui.test.ts`](../../tests/api/swagger-ui.test.ts); dependencia runtime `yaml`; `info.description` del OpenAPI actualizado
- **Documentación:** plan trilingüe **Swagger / OpenAPI UI** (versión **1.0.0**): [plan-swagger-openapi-ui.md](quality/plan-swagger-openapi-ui.md) · [en](../en/quality/swagger-openapi-ui-plan.md) · [pt-BR](../pt-br/quality/plano-swagger-openapi-ui.md); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) actualizado; [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (subsección contrato API), [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md); `.cursor/plans/` en `.gitignore` (copia canónica en `docs/`); fila en [trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md)
- **Toolchain:** Node **22 LTS** en CI, [`.nvmrc`](../../.nvmrc), `engines` en [`package.json`](../../package.json) (**≥ 22**); [`.npmrc`](../../.npmrc) `legacy-peer-deps` para `npm ci` con ESLint 10 + jsx-a11y
- **Documentación generada:** `npm run docs:generate` — TypeDoc → `docs/generated/typedoc/`, `@scalar/openapi-to-markdown` → [`openapi-reference.generated.md`](../api/openapi-reference.generated.md), `@adobe/jsonschema2md` (esquemas extraídos del OpenAPI) → `docs/generated/schema-md/`, `sbom:generate` → [`sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json); CI ejecuta `docs:generate` y luego `git diff` sobre rutas generadas; guía trilingüe [documentacion-generada.md](quality/documentacion-generada.md); [`.cursor/rules/doc-generation.mdc`](../../.cursor/rules/doc-generation.mdc)
- **Dependencias:** **Vite 6**, `@vitejs/plugin-react` 5.x, **Prisma 5.22**; `@types/node` 22; avisos de audit restantes ligados al CLI `npm` empaquetado (solo herramientas de desarrollo)
- **ADR-0005** — [Cobertura Vitest para `server.ts`](adr/ADR-0005-vitest-coverage-server-bootstrap.md): refactor de arranque, entrada `server/main.ts`, `tests/server/server.test.ts`
- **ADR-0006** — [CI opcional: semantic-release y Tauri self-hosted](adr/ADR-0006-release-and-tauri-ci-workflows.md): `npm audit` informativo en CI; `release.config.cjs`, `release.yml`, `tauri-selfhosted.yml`
- **CI:** `npm audit --audit-level=high` no bloqueante tras `npm ci`
- **JSDoc trilingüe** en `calculateInvoice`, `calculateItemSubtotal` y cabecera de módulo en [`src/lib/invoice.ts`](../../src/lib/invoice.ts); `createApp` en [`server/createApp.ts`](../../server/createApp.ts)
- **ADR-0004** — [smoke E2E Playwright y hoja de ruta de integración](adr/ADR-0004-e2e-playwright-integration-roadmap.md): `e2e/smoke.spec.ts`, `playwright.config.ts`, CI instala Chromium y ejecuta `npm run test:e2e`; Vitest excluye `e2e/**`; **fase B:** `tests/integration/`, `npm run test:integration`, `vitest.integration.config.ts`; CI ejecuta `prisma migrate deploy` y luego integración (Prisma real; el contrato API sigue con mock)
- **Ciclo de vida documental y validación** (calidad): [ciclo-vida-y-validacion-documental.md](certificacion-iso/ciclo-vida-y-validacion-documental.md); `npm run check:docs-map` comprueba rutas del [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI ejecuta la comprobación tras la paridad i18n
- **JSDoc trilingüe** de ejemplo en `validateCUIT` en [`src/lib/validators.ts`](../../src/lib/validators.ts) (véase [estandares-codigo.md](estandares-codigo.md))
- **Nombres de archivo localizados por idioma (fase 3):** la documentación de producto y calidad en `docs/en/`, `docs/es/` y `docs/pt-br/` usa **nombres distintos por árbol**; mapa canónico en [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); los ADR conservan el **mismo slug técnico** en cada idioma
- **Especificaciones MVP ISO-ready** en [`specs/`](specs/indice.md): índice de manual técnico, RF/RNF, casos de uso, historias y criterios, casos de prueba manual (TC-001–TC-010), matriz de trazabilidad — solo contenido **basado en evidencia**; equivalentes en [inglés](../en/specs/index.md) y [portugués](../pt-br/specs/indice.md); actualizado [trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md)
- Reglas del proyecto en Cursor: [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc), [`.cursor/rules/bizcode-documentation.mdc`](../../.cursor/rules/bizcode-documentation.mdc); [AGENTS.md](../../AGENTS.md) y [CONTRIBUTING.md](../../CONTRIBUTING.md) exigen cumplimiento; convención JSDoc trilingüe en [estandares-codigo.md](estandares-codigo.md)
- Documentación del tema UI: [temas-interfaz.md](temas-interfaz.md) (Tailwind `darkMode: 'class'`, clases en `<html>`, script en `index.html`, `localStorage`); referencias en [arquitectura.md](arquitectura.md) y [estandares-codigo.md](estandares-codigo.md)
- Documentación de producto y calidad en **inglés**, **español** y **portugués brasileño** (`docs/en/`, `docs/es/`, `docs/pt-br/`); hub [README.md](../README.md); política [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md); stubs en la raíz de `docs/` que redirigen a cada idioma
- Infraestructura de tests unitarios Vitest 4 con cobertura V8 (100% en `src/lib/**`)
- ESLint 10 flat config con `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- Internacionalización react-i18next: español (predeterminado), inglés, portugués brasileño
- Script de paridad i18n (`scripts/check-i18n.ts`)
- Pipeline GitHub Actions: type-check → lint → test+coverage → paridad i18n
- Accesibilidad WCAG 2.2 AA: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-required`, `aria-describedby`, `role="alert"`, `data-testid` en botones principales
- Corpus de documentación: README, CONTRIBUTING, ADRs, especificación OpenAPI, manuales de calidad y de usuario

### Changed

- **Seguridad / puesta en marcha:** [`.env.example`](../../.env.example) ya no incluye credenciales de ejemplo para la base ni un literal de contraseña de seed por defecto; `npx prisma db seed` **exige** `BIZCODE_SEED_SUPERADMIN_PASSWORD` en `.env` (≥ 8 caracteres). Ver [seguridad.md](seguridad.md), [superadmin-bootstrap-y-rbac.md](quality/superadmin-bootstrap-y-rbac.md) y [README.md](../../README.md).
- Documentación: manuales de usuario en portugués brasileño (`docs/pt-br/user/`) ampliados al nivel del inglés; `certificacion-iso/plantillas-registros.md` completo (incl. tabla de prueba manual); `glosario.md` ampliado; título del índice ADR localizado
- Glosario y [mapa-datos-personales.md](mapa-datos-personales.md): organismo fiscal argentino como **ARCA** (con mención a la ex AFIP); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) y [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) describen **nombres de archivo localizados** por árbol (los ADR mantienen el mismo slug en los tres idiomas)

### Fixed

- Tema claro/oscuro: eliminado `class="dark"` fijo en `<body>` del `index.html` (anulaba el conmutador); alineación con script inicial y `Layout` documentada en [temas-interfaz.md](temas-interfaz.md)

---

## [0.1.0] — 2026-01-01

### Added

- Gestión de clientes: alta, edición, búsqueda por nombre/CUIT; validación de CUIT argentina
- Gestión de artículos: alta, edición, búsqueda; condición IVA por producto; listas de precio; stock
- Facturación: Factura A/B; ítems con cantidad/precio/descuento; cálculo automático de IVA según condición fiscal del cliente (RI, Monotributo, CF, Exento); listado con detalle expandible
- Catálogo de formas de pago
- Catálogo de rubros
- UX teclado primero: F2=búsqueda, F3=nuevo, F5=guardar, Ins=ítem, Del=quitar ítem, Esc=cancelar/cerrar
- UI tema oscuro con paleta slate de Tailwind
- Shell escritorio Tauri 1.5 para Windows/macOS/Linux
- API Express 5 con Prisma 5 y backend PostgreSQL 16
