# BizCode

[![Snyk](https://snyk.io/test/github/ayelenleclerc/BizCode/badge.svg)](https://snyk.io/test/github/ayelenleclerc/BizCode)

**BizCode** is a cross-platform desktop application for commercial management (customers, products, invoicing). It is built with Tauri 1.5 + React 18 + Express 5 + Prisma 5 + PostgreSQL, and developed to meet ISO 9001:2015, ISO/IEC 12207, and ISO/IEC 25010 quality standards.

---

## Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 1.5 (Rust) |
| Frontend | React 18 + TypeScript 5.3 strict |
| Build tool | Vite 5 |
| Backend API | Express 5 (embedded in Tauri sidecar) |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Testing | Vitest 4 + Testing Library |
| Linting | ESLint 10 (flat config) + jsx-a11y |
| i18n | react-i18next (es, en, pt-BR) |

---

## Prerequisites

- **Node.js** ≥ 22 LTS (see `package.json` `engines` and `.nvmrc`)
- **Rust** ≥ 1.77 (stable toolchain) — for Tauri builds
- **Docker** (optional) — easiest way to run PostgreSQL
- **pnpm** 10.x (`corepack enable`; see root `packageManager`)

---

## Quick Start

See [docs/en/quality/local-development-setup.md](docs/en/quality/local-development-setup.md) (ES/PT-BR paths in [docs/DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md)) for the full contributor setup. Summary:

```bash
# 1. Clone the repository
git clone <repo-url>
cd BizCode

# 2. Install dependencies
corepack enable
pnpm install --frozen-lockfile

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL

# 4. Initialize the database (SQL history is versioned under prisma/migrations/)
npx prisma migrate dev
npx prisma db seed   # creates tenant `platform` + SuperAdmin `ayelen` — set `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `.env` first (≥ 8 chars; see `.env.example`)

# 5. Start the full-stack dev server (API + Vite)
ppnpm run dev:full
```

**Login (after seed):** tenant slug `platform`, username `ayelen`, password is the value you set in `BIZCODE_SEED_SUPERADMIN_PASSWORD` (local `.env` only; never commit). Re-running the seed resets that user’s password hash to match the current env value. The `super_admin` role includes all ERP permissions plus platform permissions ([`src/lib/rbac.ts`](src/lib/rbac.ts)).

#### SuperAdmin: `npx prisma db seed` vs `pnpm run bootstrap:superadmin`

Use **one** path per environment; for day-to-day local setup, prefer **`npx prisma db seed`** after migrations.

| | `npx prisma db seed` | `pnpm run bootstrap:superadmin` |
|---|---|---|
| Entry | [`prisma/seed.ts`](prisma/seed.ts) (logic in [`prisma/seedSuperAdmin.ts`](prisma/seedSuperAdmin.ts)) | [`scripts/bootstrap-superadmin.ts`](scripts/bootstrap-superadmin.ts) |
| Password env | `BIZCODE_SEED_SUPERADMIN_PASSWORD` (required; ≥ 8 characters) | `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` (required) |
| Username | Fixed `ayelen` | Optional `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (default `Ayelen`, normalized to lowercase on save) |
| On repeat run | Upserts tenant + user; **always refreshes** the stored password hash from the current env | If the user already exists: **no database changes** (hash unchanged). If missing: creates user and an audit event. |

Automated tests cover the seed logic via [`tests/scripts/seed-superadmin.test.ts`](tests/scripts/seed-superadmin.test.ts) (`runSuperAdminSeed`).

**Troubleshooting (web login):** If login fails with a “cannot reach the server” style message (localized in the UI), start the API on port 3001 (`pnpm run server` or `ppnpm run dev:full`) and inspect the browser **Network** tab for `POST …/api/auth/login`.

### Available Scripts

| Script | Purpose |
|---|---|
| `ppnpm run dev:full` | Start Express API + Vite dev server concurrently |
| `pnpm run dev:vite` | Vite dev server only |
| `pnpm run server` | Express API server only (port 3001) |
| `pnpm run build:web` | Production Vite build |
| `pnpm run type-check` | TypeScript type check (no emit) |
| `pnpm run lint` | ESLint + jsx-a11y (cero advertencias; falla CI si hay warnings) |
| `pnpm run lint:fix` | ESLint with auto-fix |
| `pnpm run test` | Run unit tests + API contract tests (OpenAPI + supertest) |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run test:coverage` | Run tests with V8 coverage report |
| `pnpm run test:e2e` | Playwright smoke against Vite preview (`e2e/`; see ADR-0004) |
| `pnpm run check:i18n` | Verify i18n key parity across locales |
| `pnpm run check:docs-map` | Verify paths in `docs/DOCUMENT_LOCALE_MAP.md` exist |
| `pnpm run bootstrap:superadmin` | Optional one-off SuperAdmin creation (see table above; uses `BIZCODE_BOOTSTRAP_*` env vars) |
| `pnpm run migrate:dbf` | Migración desde DBF (script `scripts/migrate-from-dbf.ts`) |
| `pnpm run reparto-ubicacion:purge` | Purge GPS location samples older than 7 days (`logistics.gps`; see [privacy data map](docs/en/privacy-data-map.md)) |

### Logistics (issues #140–#145)

When tenant modules are enabled: **delivery orders** (`/logistica`), **picking** (`logistics.picking`), **routes** (`logistics.dispatches`), **driver POD** (`logistics.pod`), **live GPS** (`logistics.gps`, map at `/logistica/seguimiento`), and **KPIs/reports** (tab on `/logistica`, #145). Operator manual (EN): [docs/en/user/manual-logistics.md](docs/en/user/manual-logistics.md) · ES/PT-BR paths in [docs/DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Express API port (default: 3001) |
| `VITE_API_URL` | No | API base URL seen by the frontend (default: http://localhost:3001) |
| `BIZCODE_SEED_SUPERADMIN_PASSWORD` | Yes (to run seed) | SuperAdmin (`ayelen` / tenant `platform`); define only in local `.env` (≥ 8 characters). See `.env.example`. |
| `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` | Yes (to run `bootstrap:superadmin`) | Password for the optional bootstrap script; local `.env` only. |
| `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` | No | Display username for bootstrap (default `Ayelen`); stored lowercase. |

---

## Documentation

All product and quality Markdown is maintained in **English**, **Spanish**, and **Brazilian Portuguese** (`docs/en/`, `docs/es/`, `docs/pt-br/`). Entry points:

| Document | Description |
|---|---|
| [docs/README.md](docs/README.md) | Trilingual hub (EN / ES / PT-BR links) |
| [docs/I18N_DOCUMENTATION.md](docs/I18N_DOCUMENTATION.md) | Policy for documentation locales |
| [docs/DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md) | Canonical map: logical document → path per locale |
| [docs/en/README.md](docs/en/README.md) | Full index (English) |
| [docs/es/README.md](docs/es/README.md) | Índice completo (español) |
| [docs/pt-br/README.md](docs/pt-br/README.md) | Índice completo (português) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branch workflow, commit convention, Definition of Done |
| [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc) | Mandatory Cursor/AI rules (always on); see also [`bizcode-documentation.mdc`](.cursor/rules/bizcode-documentation.mdc) for `docs/**` |
| [docs/api/openapi.yaml](docs/api/openapi.yaml) | OpenAPI 3.1 API specification (single file, not translated) |
| Swagger UI | `http://localhost:3001/api-docs/` when the API server is running (`pnpm run server`; same spec as OpenAPI) |
| [docs/en/quality/swagger-openapi-ui-plan.md](docs/en/quality/swagger-openapi-ui-plan.md) | Swagger UI + OpenAPI implementation plan (mirrored in [es](docs/es/quality/plan-swagger-openapi-ui.md) / [pt-BR](docs/pt-br/quality/plano-swagger-openapi-ui.md); versioned; see [DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md)) |

Root-level files under `docs/*.md` (except the hub above) are **redirect stubs** to the three locale copies — use the language you need from [docs/README.md](docs/README.md).

---

## License

Proprietary. All rights reserved.
