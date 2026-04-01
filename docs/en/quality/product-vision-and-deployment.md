# Product vision: desktop, SaaS, and fiscal modularity

**Evidence ID:** PROD-VISION-001  
**Related ADR:** [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md)

## Purpose

This document captures **strategic product and architecture direction** so contributors and automation (e.g. Cursor agents) align on **one core product** delivered as **desktop** and, when implemented, **SaaS**, with **fiscal rules isolated per country or jurisdiction**. It does **not** replace legal or tax advice per market.

## Two delivery modes, one core

- **Desktop (current):** Tauri shell, React SPA, Express API sidecar, PostgreSQL — see [architecture.md](../architecture.md).
- **SaaS (target capability):** Same business domain as **web client + hosted API + managed database** (multi-tenant if required).
- **Intent:** Avoid two divergent codebases. Share **domain logic**, **data model** where feasible, and **API contract** ([OpenAPI](../../api/openapi.yaml)); vary **how the stack runs** (local binary vs cloud) via adapters and configuration.

**Channel vs jurisdiction:** “Desktop vs cloud” and “Argentina vs other countries” are **independent dimensions**. Commercial priorities (e.g. desktop-first in Argentina, SaaS abroad) are valid but must not be hard-coded as “only X can use Y” without an explicit product decision documented here or in an ADR.

## Multi-user desktop

Desktop deployments may have **multiple users** (e.g. office/LAN). User, role, and audit concepts should remain **conceptually compatible** with a future SaaS model (same entities; different isolation and deployment policies).

## Fiscal modules by country

- **Regulatory variation** (e-invoicing, taxes, connections to tax authorities) is modeled as **modules or layers per country/jurisdiction**, enabled by **configuration, license, or tenant** — not as scattered `if (country)` blocks across the codebase.
- The same product can expose **domestic and international** fiscal options in **both** desktop and SaaS; what changes is **which modules are enabled**, not necessarily a full repository fork.

**Out of scope for “fiscal modules” alone:** multi-tenancy design, **your** SaaS subscription billing, data residency, and market-specific legal obligations. Those require separate design, documentation, and ADRs when implemented.

## Architecture principles

| Principle | Practice |
|-----------|----------|
| **Monorepo** | Prefer **one repository**; avoid a permanent “cloned” second repo unless there is a strong reason (separate team/release lifecycle). |
| **Core + adapters** | Stable domain and API boundary; fiscal connectors and deployment specifics **pluggable**. |
| **Clear API boundary** | OpenAPI + contract tests remain the anchor; SaaS must **respect or explicitly version** the public contract. |
| **Phased delivery** | Ship desktop with clear boundaries first; add hosted deployment without rewriting from scratch. |

## Optional containers

A **Dockerfile** / **docker-compose** for **API + PostgreSQL** (and optionally static web build) may help **server-side dev and deployment**. It does **not** replace **Tauri** native desktop builds. When introduced, document it under quality/ops alongside [ci-cd.md](ci-cd.md).

## Governance: keeping focus

- **Pull requests** that change fiscal domain or deployment assumptions should **reference** this document or [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) when decisions shift.
- **Git / GitHub:** Use the branch flow in [CONTRIBUTING.md](../../../CONTRIBUTING.md) (`main` / `develop` / feature branches); remote hosting is recommended for backup and review.
- **Legal/fiscal detail:** Keep **design decisions** here; put **country-specific regulatory detail** in certification matrices or annexes under `docs/*/certificacion-iso/` where appropriate.
- **SaaS operations:** When cloud deployment is real, link [security.md](../security.md) and [privacy-data-map.md](../privacy-data-map.md) from operational runbooks.

## References

- [architecture.md](../architecture.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
- [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) · [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)
