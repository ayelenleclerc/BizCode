# BizCode documentation (English)

## Quick links

| Document | Description |
|----------|-------------|
| [architecture.md](architecture.md) | Tauri, React, Express, Prisma, PostgreSQL |
| [theming.md](theming.md) | Light/dark theme: Tailwind `dark:`, `<html>`, `localStorage`, `index.html` |
| [coding-standards.md](coding-standards.md) | TypeScript, React, tests, i18n, `data-testid` |
| [accessibility.md](accessibility.md) | WCAG 2.2 AA, ESLint jsx-a11y, jest-axe |
| [i18n-strategy.md](i18n-strategy.md) | Locales `es`, `en`, `pt-BR`, CI parity |
| [security.md](security.md) | Threats, secrets, CORS, dependencies |
| [privacy-data-map.md](privacy-data-map.md) | Personal data inventory |
| [glossary.md](glossary.md) | Domain terminology |
| [changelog.md](changelog.md) | Version history (Keep a Changelog) |

## Quality and traceability

| Document | Description |
|----------|-------------|
| [Certificación-ISO (repo root)](../../Certificación-ISO/README.md) | Entry point to the ISO certification package (no duplicate bodies) |
| [certificacion-iso/iso-package-index.md](certificacion-iso/iso-package-index.md) | ISO certification package master register (ISO-PKG-001); **closed catalog** GOV…PROC-MAN (108 codes) |
| [certificacion-iso/controlled-document-convention.md](certificacion-iso/controlled-document-convention.md) | Naming and metadata for controlled stubs |
| [certificacion-iso/document-register-traceability.md](certificacion-iso/document-register-traceability.md) | Code → indicative clauses (QMS-DR-001) |
| [certificacion-iso/traceability-between-documents.md](certificacion-iso/traceability-between-documents.md) | Document-to-document graph (QMS-D2D-001) |
| [certificacion-iso/quality-manual.md](certificacion-iso/quality-manual.md) | QMS scope |
| [certificacion-iso/iso-traceability.md](certificacion-iso/iso-traceability.md) | Standard → repository evidence |
| [quality/testing-strategy.md](quality/testing-strategy.md) | Test pyramid, coverage policy |
| [quality/ci-cd.md](quality/ci-cd.md) | GitHub Actions pipeline |
| [certificacion-iso/records-template.md](certificacion-iso/records-template.md) | Nonconformity and test session templates |
| [certificacion-iso/document-lifecycle-and-validation.md](certificacion-iso/document-lifecycle-and-validation.md) | SemVer, changelogs, validation / verification checklist |
| [quality/swagger-openapi-ui-plan.md](quality/swagger-openapi-ui-plan.md) | Swagger UI + OpenAPI implementation reference (versioned); agent policy |
| [quality/generated-documentation.md](quality/generated-documentation.md) | TypeDoc, OpenAPI→Markdown, JSON Schema docs, SBOM — commit outputs with code changes |
| [quality/product-vision-and-deployment.md](quality/product-vision-and-deployment.md) | Desktop + SaaS direction, fiscal modules by country, governance (PROD-VISION-001) |

## Process manuals (ISO-ready)

| Document | Description |
|----------|-------------|
| [processes/index.md](processes/index.md) | PROC-MAN-001…010 — process descriptions (stubs + canonical links) |

## API and decisions

| Document | Description |
|----------|-------------|
| [../api/openapi.yaml](../api/openapi.yaml) | OpenAPI 3 contract (single file, not translated) |
| Swagger UI | `http://localhost:3001/api-docs/` when [`npm run server`](../../package.json) is running (same spec as `openapi.yaml`) |
| [adr/README.md](adr/README.md) | Architecture Decision Records index |

## End-user manuals

| Document | Description |
|----------|-------------|
| [user/manual-customers.md](user/manual-customers.md) | Customers module |
| [user/manual-products.md](user/manual-products.md) | Products module |
| [user/manual-invoicing.md](user/manual-invoicing.md) | Invoicing module |
| [user/manual-appearance.md](user/manual-appearance.md) | Light/dark theme (sidebar button) |

## Product specifications (ISO-ready MVP)

| Document | Description |
|----------|-------------|
| [specs/index.md](specs/index.md) | Index: technical manual, FR/NFR, use cases, user stories, manual test cases, traceability matrix |

---

**Other languages:** [Español](../es/README.md) · [Português (Brasil)](../pt-br/README.md) · [Documentation policy](../I18N_DOCUMENTATION.md)

Repository root: [README.md](../../README.md), [CONTRIBUTING.md](../../CONTRIBUTING.md).
