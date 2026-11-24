# ADR-0029: BizCode Local deployment topology (single site baseline)

- **Status:** Accepted (baseline evidenced); multi-site pilot choice **Pending owner / Chris decision**
- **Date:** 2026-11-23
- **Issue:** [#537](https://github.com/ayelenleclerc/BizCode/issues/537)
- **Related:** [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [ADR-0010](ADR-0010-multi-tenant-isolation.md), [local-deployment-topology.md](../quality/local-deployment-topology.md) (#537), [local-distributor-scope-matrix.md](../quality/local-distributor-scope-matrix.md) (#536)

## Context

BizCode Local for distributors (#535) needs an explicit topology: one establishment with several workstations, optional multi-branch (up to five sites), and how portal / seller / driver / e-commerce / webhooks relate to a local API. ADR-0007 already chooses **one monorepo** and **desktop + SaaS** modes. Product vision documents multi-user desktop on LAN. Architecture docs describe a Tauri shell with an Express **sidecar**; `src-tauri` currently exposes only `ping` and does **not** spawn the API ([#539](https://github.com/ayelenleclerc/BizCode/issues/539)).

Prisma models **one** PostgreSQL database per deployment (`DATABASE_URL`), with multi-warehouse (`Deposito`, including `tipo = sucursal`) and tenant isolation — **not** site-to-site database sync. Mobile offline outboxes flush to a reachable API; marketplace/payment webhooks need a publicly reachable `API_PUBLIC_URL`.

## Decision

1. **Baseline Local (single establishment):** One logical **principal** machine (or LAN host) runs **Express API + PostgreSQL** for that establishment; additional workstations are **clients** (browser / Tauri window) against that API (`VITE_API_URL` / LAN IP). No workstation accidentally creates its own independent database by default.
2. **Document vs runtime drift:** Treat “Express as Tauri sidecar” as the **target** desktop packaging story; until #539 lands, Local ops must start API (and Postgres) explicitly (`pnpm run server` / `dev:full` or equivalent service install). Docs must not claim an implemented sidecar that is Not evidenced in `src-tauri`.
3. **Warehouses ≠ sites:** `Deposito.tipo = sucursal` and `TransferenciaDeposito` (#236) are **in-database** warehouses for one tenant. They do **not** equal five independent Local installations.
4. **Multi-site (up to five locations):** Two candidate topologies remain **options for owner decision** (not implemented here):
   - **A — Shared database:** one PostgreSQL (+ API) reachable over a secure link from all sites.
   - **B — Local databases + sync:** per-site DB/API with a future sync subsystem (**Not evidenced**; must become dedicated child issues after choice).
5. **Remote channels:** Portal B2B (#240), Seller (#167+), Driver (#159+), e-commerce sync (#189), and inbound webhooks remain in the regression inventory. For Local, either expose a controlled public edge (tunnel/reverse proxy with auth) or keep those channels on a hosted path; durable public inbox + outbound sync beyond current webhooks is **out of scope** of this ADR and requires follow-up issues after topology choice.
6. **Do not** invent distributed sync, leader election, or multi-DB replication in code under this ADR.

## Consequences

- Positive: Clear single-site ops model compatible with ADR-0007; failure modes and channel assumptions documented in the topology quality doc; multi-site choice is explicit and reviewable.
- Negative: Five-site pilot cannot be claimed “ready” until owner picks A or B and follow-up issues implement packaging (#539), security (#538), and any sync work.
- Follow-up: #538 local security, #539 Windows installer / sidecar, #540 Local backups; child issues for sync **only after** multi-site decision.

## Other languages

Same slug: [Español](../../es/adr/ADR-0029-local-deployment-topology.md) · [Português (Brasil)](../../pt-br/adr/ADR-0029-local-deployment-topology.md)
