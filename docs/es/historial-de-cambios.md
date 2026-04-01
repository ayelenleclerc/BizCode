# Changelog

Todos los cambios notables de BizCode se documentan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
Versionado: [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Added

- **Ciclo de vida documental y validación** (calidad): [ciclo-vida-y-validacion-documental.md](quality/ciclo-vida-y-validacion-documental.md); `npm run check:docs-map` comprueba rutas del [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI ejecuta la comprobación tras la paridad i18n
- **JSDoc trilingüe** de ejemplo en `validateCUIT` en [`src/lib/validators.ts`](../../src/lib/validators.ts) (véase [estandares-codigo.md](estandares-codigo.md))
- **Nombres de archivo localizados por idioma (fase 3):** la documentación de producto y calidad en `docs/en/`, `docs/es/` y `docs/pt-br/` usa **nombres distintos por árbol**; mapa canónico en [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); los ADR conservan el **mismo slug técnico** en cada idioma
- **Especificaciones MVP ISO-ready** en [`specs/`](specs/indice.md): índice de manual técnico, RF/RNF, casos de uso, historias y criterios, casos de prueba manual (TC-001–TC-010), matriz de trazabilidad — solo contenido **basado en evidencia**; equivalentes en [inglés](../en/specs/index.md) y [portugués](../pt-br/specs/indice.md); actualizado [trazabilidad-iso.md](quality/trazabilidad-iso.md)
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

- Documentación: manuales de usuario en portugués brasileño (`docs/pt-br/user/`) ampliados al nivel del inglés; `quality/plantillas-registros.md` completo (incl. tabla de prueba manual); `glosario.md` ampliado; título del índice ADR localizado
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
