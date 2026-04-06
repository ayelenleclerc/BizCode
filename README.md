# BizCode

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
- **PostgreSQL** 15 or 16

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd BizCode

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL

# 4. Initialize the database
npx prisma migrate dev --name init
npx prisma db seed   # creates tenant `platform` + SuperAdmin `ayelen` (password: `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `.env`, default see `.env.example`)

# 5. Start the full-stack dev server (API + Vite)
npm run dev:full
```

**Login (after seed):** tenant slug `platform`, username `ayelen`, password from `BIZCODE_SEED_SUPERADMIN_PASSWORD` (default `Yuskia13` in `.env.example` only for local dev). Re-running the seed resets that user’s password hash to match the current env value. The `super_admin` role includes all ERP permissions plus platform permissions ([`src/lib/rbac.ts`](src/lib/rbac.ts)).

### Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev:full` | Start Express API + Vite dev server concurrently |
| `npm run dev:vite` | Vite dev server only |
| `npm run server` | Express API server only (port 3001) |
| `npm run build:web` | Production Vite build |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run lint` | ESLint + jsx-a11y (cero advertencias; falla CI si hay warnings) |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run test` | Run unit tests + API contract tests (OpenAPI + supertest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run test:e2e` | Playwright smoke against Vite preview (`e2e/`; see ADR-0004) |
| `npm run check:i18n` | Verify i18n key parity across locales |
| `npm run check:docs-map` | Verify paths in `docs/DOCUMENT_LOCALE_MAP.md` exist |
| `npm run migrate:dbf` | Migración desde DBF (script `scripts/migrate-from-dbf.ts`) |

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Express API port (default: 3001) |
| `VITE_API_URL` | No | API base URL seen by the frontend (default: http://localhost:3001) |
| `BIZCODE_SEED_SUPERADMIN_PASSWORD` | No | Password for seeded SuperAdmin (`ayelen` / tenant `platform`); see `.env.example`. Override outside local dev. |

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
| Swagger UI | `http://localhost:3001/api-docs/` when the API server is running (`npm run server`; same spec as OpenAPI) |
| [docs/en/quality/swagger-openapi-ui-plan.md](docs/en/quality/swagger-openapi-ui-plan.md) | Swagger UI + OpenAPI implementation plan (mirrored in [es](docs/es/quality/plan-swagger-openapi-ui.md) / [pt-BR](docs/pt-br/quality/plano-swagger-openapi-ui.md); versioned; see [DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md)) |

Root-level files under `docs/*.md` (except the hub above) are **redirect stubs** to the three locale copies — use the language you need from [docs/README.md](docs/README.md).

---

## License

Proprietary. All rights reserved.
