# ADR-0007: Dual deployment (desktop / SaaS) and fiscal modularity

**Status:** Accepted  
**Date:** 2026-04-01  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design); ISO 9001:2015 §8.3.3 (design outputs)

---

## Context

BizCode today ships as a **Tauri desktop** application with a **local Express API** and **PostgreSQL** ([architecture.md](../architecture.md)). Product strategy targets **the same domain** for **hosted SaaS** in the future and **country-specific fiscal behavior** (e-invoicing, tax rules, authority integrations) without maintaining **two unrelated products** or a permanent **forked repository**.

Options considered:

1. **Separate cloned repository** for SaaS — fast MVP but high long-term drift and duplicate fixes.
2. **Single monorepo, shared core, pluggable fiscal modules and deployment adapters** — more upfront discipline, one source of truth.

## Decision

1. **One repository / monorepo** remains the default; avoid a second permanent “SaaS-only” clone unless a strong external constraint appears (documented in a future ADR).
2. **Two delivery modes** are first-class goals: **desktop** (current) and **SaaS** (web + hosted API + managed DB, multi-tenant when needed). They share **domain logic** and **API contract** ([OpenAPI](../../api/openapi.yaml)); deployment and isolation differ.
3. **Fiscal behavior** is organized as **modules or layers per country/jurisdiction**, enabled by **configuration, license, or tenant** — not duplicated as ad-hoc conditionals across unrelated files.
4. **Channel (desktop vs cloud) and jurisdiction (e.g. Argentina vs other countries)** are **independent** product dimensions; commercial prioritization must not be encoded as hard technical coupling without explicit documentation ([product-vision-and-deployment.md](../quality/product-vision-and-deployment.md)).
5. **Optional Docker** for API + database is allowed for server-side dev/deploy when introduced; it does **not** replace Tauri native builds (see product vision doc).

## Consequences

- **Positive:** Clear evolution path to SaaS; fiscal extensions localized; contract tests and OpenAPI remain the integration anchor.
- **Negative:** Requires discipline in PRs (reference vision doc or this ADR when changing deployment or fiscal assumptions); SaaS-specific concerns (subscription billing, data residency, tenant isolation) need **additional** ADRs when implemented.
- **API:** Any public SaaS API must **align with or explicitly version** the OpenAPI contract; breaking changes need ADR and contract-test updates per [ADR-0003](ADR-0003-api-contract-testing.md).

## References

- [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md) (PROD-VISION-001)
- [architecture.md](../architecture.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
