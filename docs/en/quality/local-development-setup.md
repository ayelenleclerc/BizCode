# Local development setup

Contributor onboarding for running BizCode locally (PostgreSQL, migrations, seed, API + Vite). For CI/test parity, see [test-environments-parity.md](test-environments-parity.md).

## Monorepo layout

BizCode uses **pnpm workspaces** and **Turborepo** (#154):

| Path | Role |
|------|------|
| `apps/web/` | React + Vite frontend |
| `apps/server/` | Express API |
| `apps/seller/` | Expo (React Native) App Seller — field sales (#167–#172) |

| `packages/types/` | Shared TypeScript types and RBAC contracts |
| `packages/api-client/` | HTTP API client |
| `prisma/` | Database schema and migrations (repo root) |
| `tests/`, `e2e/` | Shared test suites (repo root) |

Install and run commands from the **repository root**.

### API client (`@bizcode/api-client`)

The shared HTTP client lives in `packages/api-client/`. It no longer reads Vite env vars directly (React Native–ready): `apps/web` calls `initApiClientFromEnv()` from `apps/web/src/lib/api-config.ts` in `main.tsx` before render, binding `VITE_API_URL` via `configureApiClients()`. Default base URL when unset: `http://localhost:3001/api`. Domain APIs are split under `packages/api-client/src/modules/`; `createApiClient()` / `createPortalApiClient()` accept an optional base URL for non-web hosts.

Optional in `.env` for the web app:

- `VITE_API_URL` — full API base including `/api` (e.g. `http://localhost:3001/api`)

### App Seller (`apps/seller`, #167–#172)

Expo SDK app with Expo Router. UI uses React Native Paper (shared `@bizcode/ui` is deferred to #157). Auth uses **Bearer dual** mode: the API still sets HttpOnly cookies for the web app and also returns `accessToken` / `refreshToken` / `expiresIn` in the login and refresh JSON bodies. The seller app stores those tokens in **expo-secure-store** (never AsyncStorage) and sends `Authorization: Bearer` plus `x-bizcode-channel: field`.

Allowed roles: `seller`, `manager`, `owner`. Other roles see an accessible “seller-only” denial screen.

**Customers (#168):** online search (`GET /api/clientes?q=`) and customer detail with Account / Orders / Details tabs (balance via `GET …/cuenta-corriente/saldo` when `finance.ledger` is enabled, overdue invoices via `GET …/facturas-pendientes` when `finance.receipts` is enabled, recent pedidos, contact + dialer, payment score). Roles with `customers.read` may call those two GET endpoints (full ledger / receipts write still require `reports.financial.read`). Offline cache is **#171**.

**Order taking (#169):** from the customer card, **New order** opens `/pedidos/nuevo?clienteId=` with online catalog (`GET /api/articulos`, rubros), in-memory cart, summary (line discount, `condicionCobro` / `plazoDias`, warehouse `observaciones`), then `POST /api/pedidos` + `POST …/confirm`. Stock and credit over-limit are warnings only. Offline catalog/order queue remains **#171**.

**Agenda / Mi Ruta Hoy (#170 + #267):** tab `/agenda` is **Mi Ruta Hoy**: `GET/POST /api/rutas`, stop reorder/replace, `PATCH` estado (`visitado` → `/(app)/pedidos/nuevo?clienteId=` and links/creates `VisitaVendedor`; `postergado` → next non-`Feriado` day; `no_visitado` + motivo). Holiday banner via `GET /api/feriados?fecha=`. Map pins with `react-native-maps` only when `Cliente.latitud`/`longitud` are set (no geocoder). Offline outbox extends to route create/paradas/patch. Managers watch progress on web `/visitas` (`GET /api/rutas/:id/stats`, 60s polling) and assign `VendedorZona`. Seed AR holidays: `npm run feriados:seed-ar` (fixture under `scripts/data/`; optional `--live`).

**Offline mode (#171):** after login (online), the app hydrates a day cache into `expo-sqlite` (clientes, artículos, rubros, agenda/ruta, feriados del día, recent pedidos) with MMKV metadata (`cacheDay`; in-memory fallback if MMKV native is unavailable). With no signal, lists/ficha/catálogo/ruta/pedido confirm read from SQLite and enqueue writes (pedidos confirm, visitas, rutas) into a FIFO outbox flushed by NetInfo on reconnect. Banner shows offline date and pending sync count. Cache invalidates when the local calendar day changes. Primary target is native Expo; maps may require a development build rather than Expo Go.

**Push notifications (#172):** on authenticated session the app requests notification permission, obtains an Expo push token, and registers it via `POST /api/users/me/push-token` (deleted on logout). Backend sends Expo Push for pedido confirm/cancel (to `pedido.vendedorId`), customer credit alerts / payments (sellers by `VendedorZona` + recent pedidos), and chat messages. Profile tab `/perfil` mutes types via `GET/PUT /api/users/me/push-preferences`. Notification taps deep-link to pedido or cliente screens. Shared token/Expo pipeline is reused later by App Driver (#165). Physical push delivery needs a native build / Expo project credentials; CI covers API + Expo sender unit tests.

**Check-mode suggestions (#254):** `GET /api/clientes/:id/sugerencias-pedido` returns habituales (6-month frequency ranking, suggested qty, anomaly chip) and active `ArticuloOferta` rows not already habitual. On `/pedidos/nuevo` with empty search, sections appear above the catalog; first add uses suggested qty; stock caps reuse #256. Offline hydrate caches suggestions in SQLite.

**Barcode scanner (#255):** set `Articulo.codigoBarras` on the web article form. On `/pedidos/nuevo`, **Scan barcode** opens `/pedidos/escanear` (`expo-camera`). Lookup is local SQLite first, then `GET /api/articulos?codigoBarras=`. Apply Prisma migration `20260812180000_articulo_codigo_barras_255` against Docker Postgres `:5432`.

**Repeat last order + templates (#253):** customer card CTA `GET /api/clientes/:id/ultimo-pedido-repeat` prefills the cart (`CartContext.replaceLines`) with current list prices; inactive/parent/missing/service lines are omitted (banner on `/pedidos/nuevo`). Templates: `GET|POST /api/clientes/:id/plantillas-pedido` and `GET|PATCH|DELETE /api/plantillas-pedido/:id` plus `GET …/cargar`. Offline hydrate caches templates and last-order prefill in SQLite. Web manager UI is out of scope.

**Debt/stock alerts (#256):** `TenantConfig` seller policies (defaults: over-limit `block`, overdue `warn`, stock-zero `warn`, qty capped to stock). Seller reads `GET /api/tenant-config/seller-policies` (`orders.create`); owners/managers patch with `settings.business.manage` or `users.manage`. Customer card opens a credit dialog from `GET /api/clientes/:id/estado-credito` (levels `ok`/`amarillo`/`naranja`/`rojo`). Order cart uses `GET /api/articulos/stock-multiple?ids=` for inline stock colours and caps; summary can block confirm by policy. Offline hydrate also caches credit/stock/policies with an `asOf` timestamp banner. No in-app collections and no manager-approval workflow.

UI strings use **i18next** (EN / ES / pt-BR) with `expo-localization` for device language.

```bash
# Terminal 1 — API
pnpm run server

# Terminal 2 — Expo
pnpm --filter @bizcode/seller start
```

Optional env for the seller app (Expo public):

- `EXPO_PUBLIC_API_BASE_URL` — default `http://localhost:3001/api`

Type-check:

```bash
pnpm --filter @bizcode/seller type-check
```

**CORS / Expo web:** default allowed origins include Vite (`5173`/`4173`) and Expo web (`8081`, `19006`). For a device or custom origin, set `CORS_ORIGINS` (comma-separated) in `.env`. Native Expo Go / development builds typically do not send a browser `Origin` header.

**Physical device:** point `EXPO_PUBLIC_API_BASE_URL` at your machine’s LAN IP (e.g. `http://192.168.x.x:3001/api`), not `localhost`.

**Note:** `@bizcode/ui` (#157) is out of scope for #167/#168; do not block type-check or login on that package.

## Requirements

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **pnpm** 10.x (declared in root `packageManager`; enable via `corepack enable`)
- **Rust** ≥ 1.77 (stable) for Tauri desktop builds
- **PostgreSQL** 15 or 16, or **Docker** for the compose file below

## Clone and install

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
corepack enable
pnpm install --frozen-lockfile
```

### Windows notes (pnpm)

If `pnpm install` fails with `EPERM` / `ENOENT` while renaming packages under `node_modules`, use the Windows helper (retries + optional Defender **path** exclusions for this repo and the pnpm store only; it does **not** disable real-time protection):

```bat
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1 -FrozenLockfile
```

Repo settings exclude `node_modules` from the editor file watcher (`.vscode/settings.json`). Prefer hardlinks over `package-import-method=copy` (see root `.npmrc` and [CONTRIBUTING.md](../../../CONTRIBUTING.md)).

## Environment

Copy [`.env.example`](../../../.env.example) to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — session HMAC secret (required in non-test runs; see `apps/server/config/env.ts`)
- `BIZCODE_SEED_SUPERADMIN_PASSWORD` — ≥ 8 characters before `npx prisma db seed`

Optional variables are documented in `.env.example` (CORS, rate limits, SMTP, etc.).

## PostgreSQL

**Docker (recommended):** from the repo root:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Point `DATABASE_URL` at the published port in `docker-compose.postgres.yml`.

**Native install:** create an empty database and set `DATABASE_URL` accordingly.

## Schema and seed

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`pnpm run seed` runs the same entry as `prisma/seed.ts` via `tsx`. After seed, sign in with tenant slug `platform`, username `ayelen`, and the password from `BIZCODE_SEED_SUPERADMIN_PASSWORD` (see [README.md](../../../README.md)).

## Run the app

| Command | Purpose |
|---------|---------|
| `pnpm run dev:full` | API sidecar + Vite dev server |
| `pnpm run server` | API only (`http://localhost:3001`) |
| `pnpm run dev:vite` | Vite only (`http://localhost:5173`) |
| `pnpm --filter @bizcode/seller start` | Expo App Seller (Expo Go / simulator) |
| `pnpm run dev` | Tauri desktop dev (requires Rust toolchain) |

OpenAPI/Swagger UI when the API is running: `http://localhost:3001/api-docs/`.

## Quality gate (local)

```bash
pnpm run type-check
pnpm run test
pnpm run test:coverage
pnpm run test:integration
pnpm run test:e2e
```

## Troubleshooting

- **Login cannot reach the server:** ensure the API listens on port 3001 (`pnpm run server` or `pnpm run dev:full`); check the browser network tab for `POST /api/auth/login`.
- **Port conflicts:** change the API port only if you also update the Vite proxy and client base URL in code; default evidence is port 3001.
- **Database connection errors:** verify `DATABASE_URL`, that PostgreSQL is running, and that migrations applied (`npx prisma migrate dev`).
- **Tauri build failures:** install the Rust stable toolchain and platform dependencies required by Tauri 1.5.
- **PowerShell blocks package managers:** use Command Prompt, Git Bash, or `pnpm.cmd` (see [CONTRIBUTING.md](../../../CONTRIBUTING.md)).
