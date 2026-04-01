# Changelog

All notable changes to BizCode are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- **Document lifecycle & validation** (quality): [document-lifecycle-and-validation.md](quality/document-lifecycle-and-validation.md); `npm run check:docs-map` validates paths in [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI runs the check after i18n parity
- **Trilingual JSDoc** example on `validateCUIT` in [`src/lib/validators.ts`](../../src/lib/validators.ts) (see [coding-standards.md](coding-standards.md))
- **Documentation locale filenames (phase 3):** product/quality Markdown under `docs/en/`, `docs/es/`, and `docs/pt-br/` use **localized file names** per tree; canonical mapping in [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); ADR files keep the **same technical slug** in each locale
- **ISO-ready MVP specs** under [`specs/`](specs/index.md): technical manual index, functional/non-functional requirements, use cases, user stories and acceptance criteria, manual test cases (TC-001–TC-010), traceability matrix — content **evidence-based only**; mirrored in [`../es/specs/`](../es/specs/indice.md) and [`../pt-br/specs/`](../pt-br/specs/indice.md); [`iso-traceability.md`](quality/iso-traceability.md) updated
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

- Documentation: Brazilian Portuguese (`docs/pt-br/`) user manuals expanded to match English; full `quality/records-template.md` (including manual test session table); expanded `glossary.md`; localized ADR index title
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
