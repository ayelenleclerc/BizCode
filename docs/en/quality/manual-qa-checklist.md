# Manual QA checklist

Use this checklist for releases, regression passes, or audit evidence when automated suites do not cover a scenario (e.g. Tauri desktop shell).

**Related:** [testing-strategy.md](testing-strategy.md) · [test-environments-parity.md](test-environments-parity.md)

---

## Entry criteria

- [ ] Node.js 22 LTS (`package.json` `engines`)
- [ ] `DATABASE_URL` valid; migrations applied (`npx prisma migrate deploy`)
- [ ] Seed or bootstrap completed if login tests needed (`BIZCODE_SEED_SUPERADMIN_PASSWORD` / `npx prisma db seed`)
- [ ] Automated gate green on the same commit: `npm run type-check`, `npm run lint`, `npm run test:coverage`, `npm run test:integration` (if DB available), `npm run test:e2e`

## Functional smoke (web / Vite)

- [ ] Login: tenant `platform`, user `ayelen`, password from env
- [ ] Navigate: Inicio, Clientes, Artículos, Facturación — pages render without console errors
- [ ] Create flow: at least one cliente or artículo (or cancel without persisting) — record result

## Desktop (Tauri) — if applicable

- [ ] `npm run dev` / packaged build opens window; same smoke as web where routes exist
- [ ] Note gaps vs Playwright (native shell not in CI)

## Accessibility (manual)

- [ ] Tab order usable on login and one main module
- [ ] Visible focus; form errors associated with fields where tested

## Logistics (#140–#145) — when modules enabled

Prerequisites: tenant modules `logistics.dispatches` (+ `logistics.picking`, `logistics.pod`, `logistics.gps` as needed); roles/permissions per [rbac-matrix-roles-permissions-scopes.md](rbac-matrix-roles-permissions-scopes.md); manual [manual-logistics.md](../user/manual-logistics.md).

- [ ] **Delivery orders** (`/logistica`): list/filter; create or update estado if permitted
- [ ] **Picking** (`/logistica/picking`, `logistics.picking`): take OE → checklist → mark ready (`ready`)
- [ ] **Routes** (`/logistica/repartos`, `logistics.dispatches`): create route with ready OEs → start → close
- [ ] **Driver POD** (`/logistica/repartos/chofer`, `logistics.pod`): confirm one stop with signature; back-office shows proof
- [ ] **GPS tracking** (`/logistica/seguimiento`, `logistics.gps`): planner map lists `on_route` routes; optional driver geolocation on chofer app (denied permission must not block POD)
- [ ] **Reports (#145)** (`/logistica` → **Reports** tab, `logistics.dispatches`): KPI cards and driver/zone tables load for a period; optional driver filter applies to KPIs and both tables; CSV export for drivers and zones

## Exit criteria

- [ ] Checklist completed or defects logged with severity
- [ ] Evidence attached (ticket ID, screenshots, or test run logs)

---

**Other locales:** [Español](../../es/quality/lista-verificacion-qa-manual.md) · [Português BR](../../pt-br/quality/lista-verificacao-qa-manual.md)
