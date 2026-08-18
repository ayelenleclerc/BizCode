# Local development setup

Contributor onboarding for running BizCode locally (PostgreSQL, migrations, seed, API + Vite). For CI/test parity, see [test-environments-parity.md](test-environments-parity.md).

## Monorepo layout

BizCode uses **pnpm workspaces** and **Turborepo** (#154):

| Path | Role |
|------|------|
| `apps/web/` | React + Vite frontend |
| `apps/server/` | Express API |
| `apps/seller/` | Expo (React Native) App Seller — field sales (#167–#172) |
| `apps/driver/` | Expo (React Native) App Driver — delivery (#159–#166) |

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

**Native numpad + quick discount (#264):** tap quantity on catalog / suggestions / summary / scanner to open `NumpadSheet` (no system keyboard). Decimal separator follows seller i18n locale (`,` for ES/pt-BR, `.` for EN). Summary rows swipe to **% Disc** / **Remove**; footer **Discount all lines** sets the same `dscto` (0–100) on every cart line. Persist uses existing `PedidoItem.dscto` (no new API). Stock caps from #256 still apply.

**WhatsApp order confirmation (#265):** after confirm, success + detail show **Send via WhatsApp**. Link mode opens `wa.me/{Cliente.telef}` (digits only; there is no `celular` field). Twilio requires module `comms.whatsapp` plus `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM` (see `.env.example`). Preview `GET /api/pedidos/{id}/whatsapp-share`; send/audit `POST /api/pedidos/{id}/whatsapp` `{ canal: link|twilio }` writes `AuditEvent` `whatsapp_enviado` (no `PedidoEvento`). Optional template `TenantConfig.sellerWhatsappTemplate` on seller-policies (no new web UI). Message ≤1024 chars. Offline queued orders (`id < 0`) can open wa.me from a local snapshot; Twilio is disabled. Apply Prisma migration `20260813120000_seller_whatsapp_template_265` against Docker Postgres `:5432`.

**Speech-to-order (#266, [ADR-0020](../adr/ADR-0020-seller-speech-to-order.md)):** on `/pedidos/nuevo`, **Dictate order** records speech. Online: `POST /api/voice/transcribe` (Whisper, `OPENAI_API_KEY` on the **server** only). Offline or 503/timeout: on-device STT (`expo-speech-recognition`; needs an EAS native build, not Expo Go). Parser + fuzzy top-3 run on the device; **nothing** is added to the cart until confirm/discard. Units map to `Articulo.unidadBase` (there is no `unidadMedida`). Warehouse noise is a **manual** device check, not CI. No Prisma migration.

**Visual catalog grid (#257):** `GET /api/articulos` and `GET /api/articulos/{id}` include optional `urlThumb` (`/uploads/articulos/...`, principal image from #235; `products.read`; no `catalog.variants` module, no CDN/S3, no Prisma migration). On `/pedidos/nuevo`, toggle list/grid (MMKV `seller.catalogView`); grid uses `FlashList` (2 columns, 3 on wide screens) with `expo-image`, stock grayscale + out-of-stock badge, offer badge from #254, rubro section headers when “all” is selected. Tap opens `NumpadSheet` (#264); long-press shows existing fields (description, code, price, stock). Offline hydrate prefetches thumbs via `expo-file-system`; local search (`LIMIT 500`) runs first when the query has 2+ characters. Family nav remains **Rubro** chips (`CategoriaArticulo` tree out of scope). Parent SKUs stay filtered (`!esPadre`); no parent+children picker. Tab `/catalogo` remains a stub.

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

### EAS build and OTA (#173)

Managed Expo workflow (`apps/seller`). Native `android/` / `ios/` stay gitignored. There is **no** committed Expo `projectId`.

Operator (once):

1. From `apps/seller`, run `eas init` on an Expo account (writes the real project UUID).
2. Store GitHub secrets `EXPO_TOKEN` and `EAS_PROJECT_ID` (see `.env.example` comments). Optional secret `EXPO_PUBLIC_API_BASE_URL` is baked into native builds.
3. Do **not** commit the UUID into git; `app.config.ts` sets `extra.eas.projectId` and `updates.url` only when `EAS_PROJECT_ID` is present. Push tokens (#172) already read that extra field.

Profiles in `apps/seller/eas.json`:

| Profile | Android | iOS | Distribution |
|---|---|---|---|
| `production` | AAB (`app-bundle`) | IPA (`simulator: false`) | `store` |
| `internal` | APK | IPA | `internal` |

OTA uses `expo-updates` with `runtimeVersion.policy: appVersion` (app version `0.1.0`). CI runs `eas update --channel production` on tag `seller-v*`. This PR does **not** measure OTA latency on a device.

Local wrappers (need Expo login / `EXPO_TOKEN`; `eas-cli@16` via `pnpm dlx`, not a production dependency):

```bash
pnpm --filter @bizcode/seller eas:build:production
pnpm --filter @bizcode/seller eas:build:internal
pnpm --filter @bizcode/seller eas:update
```

First Play Console / App Store upload and Apple Developer / `eas submit` are **manual** (operator). Quality Gate does **not** run EAS.

### Google Play listing copy (#173)

Reuse existing `apps/seller/assets/` icon and splash. **No** store screenshots are in the repo.

Privacy policy URL: `{PUBLIC_WEB_ORIGIN}/privacidad` (public page from #195; operator supplies the deployed origin).

**EN — short:** Field sales for BizCode: customers, orders, catalog, and daily route.

**EN — full:** BizCode Seller is the field-sales app for the BizCode ERP. Sellers sign in with their company account, look up customers, take orders (catalog, scanner, suggestions), confirm visits on the daily route, and work offline with later sync. Push notifications and WhatsApp confirmation use the company BizCode server. This listing does not collect store screenshots in the repository; use device captures from a signed build.

**ES — corta:** Ventas de campo para BizCode: clientes, pedidos, catálogo y ruta del día.

**ES — completa:** BizCode Seller es la app de vendedor de campo del ERP BizCode. El vendedor inicia sesión con la cuenta de la empresa, consulta clientes, toma pedidos (catálogo, escáner, sugerencias), confirma visitas en la ruta del día y trabaja sin conexión con sincronización posterior. Las notificaciones push y la confirmación por WhatsApp usan el servidor BizCode de la empresa. No hay capturas de Play Store en el repositorio; usar capturas de un build firmado.

**Note:** `@bizcode/ui` (#157) is out of scope for #167/#168; do not block type-check or login on that package.

### App Driver (`apps/driver`, #159–#162)

Expo SDK app with Expo Router (same stack as Seller). Auth uses **Bearer dual** mode with tokens in **expo-secure-store** and `Authorization: Bearer` plus `x-bizcode-channel: field`.

Allowed role: **`driver`** only. Other roles see an accessible “driver-only” denial screen.

**Day route (#160):** tab `/ruta` loads `GET /api/repartos/mi-reparto` (`orders.deliver.confirm` + module `logistics.dispatches`; `choferId` is always the authenticated user). Prefers today’s `on_route` reparto, else the latest `planned`. List shows sequence, customer, address, item qty, status chips, and a debt badge. Detail opens maps via `Linking` (no Google Static API key) and `tel:` for `Cliente.telef`. **Could not deliver** calls existing `PUT /api/repartos/:id/items/:itemId` with `not_delivered` + motivo (route must be `on_route`). **Collect** on a stop with debt opens `/cobros?clienteId=`. No Prisma migration. `GET /api/repartos/:id` also allows the assigned driver.

**Collections at delivery (#162):** tab `/cobros` without `clienteId` is empty (go to Route). With a `clienteId` on today's `mi-reparto`, the form shows `rsocial` + AR balance, invoice checkboxes (default amount only; `POST /api/cobros` does not impute ReciboCobro), editable amount, payment methods from `GET /api/formas-pago`, transfer CBU/alias from `GET /api/cobros/transfer-info` (or an i18n message if none), cheque fields mapped like web `CobroForm`, and notes. Amount greater than balance requires an explicit confirm dialog. Success reloads the route snapshot and offers an editable WhatsApp receipt (`Linking` to `wa.me/{Cliente.telef}` digits) plus native `Share` of the same text — no Twilio and no PDF. Deferred: cash remittance, `origenApp` / `repartoId`, server PDF. Mercado Pago QR in App Driver remains out of scope. Smoke needs a today `on_route` (or `planned`) stop with debt for user `driver`.

**Proof of delivery (#161):** **Deliver** on a pending `on_route` stop opens a 4-step wizard (recipient name + optional DNI/notes, signature canvas, optional photo, summary). Confirm calls the same `PUT /api/repartos/:id/items/:itemId` with `outcome: delivered`, required `receptorNombre` and `firmaBase64`, optional `fotoBase64`. Client compression matches server/OpenAPI: signature **50 KB**, JPEG photo **200 KB**. Empty signature disables confirm. A failed upload keeps wizard fields for retry. Success patches the stop in `RutaContext` and returns to the list. Camera and library permissions come from the `expo-image-picker` plugin. No Prisma/OpenAPI change. Smoke needs a today `on_route` reparto for user `driver` (create via web logistics planner + **Start**).

```bash
# Terminal 1 — API
pnpm run server

# Terminal 2 — Expo
pnpm --filter @bizcode/driver start
```

Optional env:

- `EXPO_PUBLIC_API_BASE_URL` — default `http://localhost:3001/api`

Type-check:

```bash
pnpm --filter @bizcode/driver type-check
```

**Manual smoke test:** create or assign a user with role `driver` in the local tenant (Docker Postgres `:5432`) and a `Reparto` for today. Seller/manager/owner accounts must land on access-denied. If the route is still `planned`, the driver can view stops but cannot mark not-delivered until a planner starts the route (`POST /api/repartos/:id/iniciar`).

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
| `pnpm --filter @bizcode/driver start` | Expo App Driver (Expo Go / simulator) |
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
