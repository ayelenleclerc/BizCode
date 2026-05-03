# Changelog

All notable changes to BizCode are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Fixed

- **CORS + session cookie:** Express `cors` now uses `credentials: true` and an origin allowlist (`http://localhost:5173`, `http://127.0.0.1:5173`, plus comma-separated `CORS_ORIGINS`) so the SPA (Axios `withCredentials`) can receive and send session cookies across origins; [`server/createApp.ts`](../../server/createApp.ts), [`.env.example`](../../.env.example), [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts); [security.md](security.md) updated.

### Added

- **User management (issue #25):** `GET/POST /api/users`, `PUT /api/users/:id`, `POST /api/auth/change-password`; Users page (`src/pages/users/`) with DataTable + create/edit modal, keyboard shortcuts (F2/F3/F5/Esc), role hierarchy enforcement; `<CanAccess permission="..." />` utility component for permission-aware rendering; sidebar link visible only to `users.manage` holders; i18n in EN/ES/PT-BR; 17 new integration tests; OpenAPI paths and schemas updated; trilingual docs in `docs/*/quality/`.
- **Plan approval archival workflow:** new `npm run plan:approve -- --plan <file>` command archives approved plans into `.cursor/plans/{timestamp}-{slug}.plan.md` and then executes the existing `plan:sync` GitHub Issues/Project v2 flow; `plan:sync` remains available for direct/manual sync.
- **Authentication UX + secure bootstrap:** login screen with route guard/logout wired to `/api/auth/login|me|logout`, cookie session support in [`src/lib/api.ts`](../../src/lib/api.ts), auth provider in [`src/auth/AuthProvider.tsx`](../../src/auth/AuthProvider.tsx), and super-admin bootstrap command `npm run bootstrap:superadmin` (password from `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`, no hardcoded credential) via [`scripts/bootstrap-superadmin.ts`](../../scripts/bootstrap-superadmin.ts).
- **Product vision & governance:** trilingual [product-vision-and-deployment.md](quality/product-vision-and-deployment.md) (PROD-VISION-001) · [es](../es/quality/vision-producto-y-despliegue.md) · [pt-BR](../pt-br/quality/visao-produto-e-implantacao.md); [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (desktop/SaaS + fiscal modularity); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) row; [AGENTS.md](../../AGENTS.md) and [`.cursor/rules/product-vision.mdc`](../../.cursor/rules/product-vision.mdc); [iso-traceability.md](certificacion-iso/iso-traceability.md) matrix; architecture cross-links
- **Documentation (ISO package):** [Certificación-ISO/README.md](../../Certificación-ISO/README.md) as repository entry point; QMS manual, ISO traceability matrix, records templates, and document lifecycle under `docs/{en,es,pt-br}/certificacion-iso/` (single source of truth); [iso-package-index.md](certificacion-iso/iso-package-index.md) (ISO-PKG-001); stubs in [`docs/quality/`](../quality/); testing strategy / CI/CD / Swagger plan remain under `docs/*/quality/`; **SBOM:** `@cyclonedx/cyclonedx-npm`, `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json) (SBOM-001), [`docs/evidence/README.md`](../evidence/README.md)
- **API:** **Swagger UI** at `http://localhost:3001/api-docs/` (`swagger-ui-express`, [`server/createApp.ts`](../../server/createApp.ts), OpenAPI from [`openapi.yaml`](../api/openapi.yaml)); [`tests/api/swagger-ui.test.ts`](../../tests/api/swagger-ui.test.ts); `yaml` runtime dependency; `info.description` in OpenAPI updated for `/api-docs`
- **Documentation:** trilingual **Swagger / OpenAPI UI implementation plan** (version **1.0.0**): [swagger-openapi-ui-plan.md](quality/swagger-openapi-ui-plan.md) · [es](../es/quality/plan-swagger-openapi-ui.md) · [pt-BR](../pt-br/quality/plano-swagger-openapi-ui.md); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) updated; [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (API contract subsection), [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md); `.cursor/plans/` gitignored (canonical copy under `docs/`); [iso-traceability.md](certificacion-iso/iso-traceability.md) matrix row
- **Toolchain:** Node **22 LTS** in CI (`.github/workflows/*.yml`), [`.nvmrc`](../../.nvmrc), `engines` in [`package.json`](../../package.json) (**≥ 22**); [`.npmrc`](../../.npmrc) `legacy-peer-deps` so `npm ci` matches ESLint 10 + jsx-a11y
- **Generated documentation:** `npm run docs:generate` — TypeDoc → `docs/generated/typedoc/`, `@scalar/openapi-to-markdown` → [`openapi-reference.generated.md`](../api/openapi-reference.generated.md), `@adobe/jsonschema2md` (schemas extracted from OpenAPI) → `docs/generated/schema-md/`, `sbom:generate` → [`sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json); CI runs `docs:generate` then `git diff` on generated paths; trilingual [generated-documentation.md](quality/generated-documentation.md); [`.cursor/rules/doc-generation.mdc`](../../.cursor/rules/doc-generation.mdc)
- **Dependencies:** **Vite 6**, `@vitejs/plugin-react` 5.x, **Prisma 5.22**; `@types/node` 22; remaining npm audit noise limited to packages bundled inside the `npm` CLI (development tooling only)
- **ADR-0005** — [Vitest coverage for `server.ts`](adr/ADR-0005-vitest-coverage-server-bootstrap.md): refactor bootstrap (`createServerInstance`, `bindHttpServer`, `startServer`), entry `server/main.ts`, `tests/server/server.test.ts`; `coverage.include` updated
- **ADR-0006** — [Optional CI: semantic-release + Tauri self-hosted](adr/ADR-0006-release-and-tauri-ci-workflows.md): `npm audit` informational in CI; `release.config.cjs` + `release.yml`; `tauri-selfhosted.yml` (`workflow_dispatch`)
- **CI:** non-blocking `npm audit --audit-level=high` after `npm ci`
- **Trilingual JSDoc** on `calculateInvoice`, `calculateItemSubtotal`, and module header in [`src/lib/invoice.ts`](../../src/lib/invoice.ts); `createApp` in [`server/createApp.ts`](../../server/createApp.ts)
- **ADR-0004** — [Playwright E2E smoke + integration roadmap](adr/ADR-0004-e2e-playwright-integration-roadmap.md): `e2e/smoke.spec.ts`, `playwright.config.ts`, CI installs Chromium and runs `npm run test:e2e`; Vitest excludes `e2e/**`; **Phase B:** `tests/integration/`, `npm run test:integration`, `vitest.integration.config.ts`; CI runs `prisma migrate deploy` then integration tests (real Prisma; contract tests still mock Prisma)
- **Document lifecycle & validation** (quality): [document-lifecycle-and-validation.md](certificacion-iso/document-lifecycle-and-validation.md); `npm run check:docs-map` validates paths in [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI runs the check after i18n parity
- **Trilingual JSDoc** example on `validateCUIT` in [`src/lib/validators.ts`](../../src/lib/validators.ts) (see [coding-standards.md](coding-standards.md))
- **Documentation locale filenames (phase 3):** product/quality Markdown under `docs/en/`, `docs/es/`, and `docs/pt-br/` use **localized file names** per tree; canonical mapping in [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); ADR files keep the **same technical slug** in each locale
- **ISO-ready MVP specs** under [`specs/`](specs/index.md): technical manual index, functional/non-functional requirements, use cases, user stories and acceptance criteria, manual test cases (TC-001–TC-010), traceability matrix — content **evidence-based only**; mirrored in [`../es/specs/`](../es/specs/indice.md) and [`../pt-br/specs/`](../pt-br/specs/indice.md); [`iso-traceability.md`](certificacion-iso/iso-traceability.md) updated
- Cursor project rules: [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (always-on), [`.cursor/rules/bizcode-documentation.mdc`](../../.cursor/rules/bizcode-documentation.mdc) (`docs/**`); [AGENTS.md](../../AGENTS.md) and [CONTRIBUTING.md](../../CONTRIBUTING.md) require compliance; trilingual JSDoc convention in [coding-standards.md](coding-standards.md)
- UI theme documentation: [theming.md](theming.md) (Tailwind `darkMode: 'class'`, classes on `<html>`, script in `index.html`, `localStorage`); references in [architecture.md](architecture.md) and [coding-standards.md](coding-standards.md)
- Product and quality documentation in **English**, **Spanish**, and **Brazilian Portuguese** under `docs/en/`, `docs/es/`, `docs/pt-br/`; hub [README.md](../README.md), policy [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md); root `docs/*.md` stubs redirect to locales
- Vitest 4 unit test infrastructure with V8 coverage (100% on `src/lib/**`)
- ESLint 10 flat config with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- react-i18next internationalization: Spanish (default), English, Brazilian Portuguese
- Automated i18n parity check script (`scripts/check-i18n.ts`)
- GitHub Actions CI pipeline: type-check → lint → test+coverage → i18n parity
- WCAG 2.2 AA accessibility: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-required`, `aria-describedby`, `role="alert"`, `data-testid` on primary buttons
- Full documentation corpus: README, CONTRIBUTING, ADRs, OpenAPI spec, quality manuals, user manuals

### Changed

- **Security / developer setup:** [`.env.example`](../../.env.example) no longer ships sample database credentials or a default seed password literal; `npx prisma db seed` **requires** `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `.env` (≥ 8 characters). See [security.md](security.md), [superadmin-bootstrap-and-rbac.md](quality/superadmin-bootstrap-and-rbac.md), and [README.md](../../README.md).
- Documentation: Brazilian Portuguese (`docs/pt-br/`) user manuals expanded to match English; full `certificacion-iso/records-template.md` (including manual test session table); expanded `glossary.md`; localized ADR index title
- Glossary and [privacy-data-map.md](privacy-data-map.md): Argentina’s tax authority referred to as **ARCA** (with former AFIP noted where relevant); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) and [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) describe **localized filenames** per locale tree (ADR slugs stay aligned across trees)

### Fixed

- Light/dark theme: removed fixed `class="dark"` on `<body>` in `index.html` (it prevented the toggle); alignment with initial script and `Layout` documented in [theming.md](theming.md)

---

## [0.1.0] — 2026-01-01

### Added

- Customer management: create, edit, search by name/CUIT; Argentine CUIT validation
- Product (articulo) management: create, edit, search; VAT condition per product; price lists; stock
- Invoicing: create Invoice A/B; line items with quantity/price/discount; automatic VAT calculation by customer tax condition (RI, Monotributo, CF, Exento); invoice list with expandable detail
- Payment methods catalogue
- Product categories (rubros) catalogue
- Keyboard-first UX: F2=search focus, F3=new record, F5=save, Ins=add item, Del=remove item, Esc=cancel/close
- Dark theme UI with Tailwind CSS slate palette
- Tauri 1.5 desktop shell for Windows/macOS/Linux
- Express 5 API with Prisma 5 + PostgreSQL 16 backend
