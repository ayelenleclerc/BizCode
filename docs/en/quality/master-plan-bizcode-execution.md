# BizCode master plan — execution index

This document is an **executable index** for the BizCode master plan (roughly 180-day horizon with **90-day milestones**). It does not replace the Cursor plan file; it links repository evidence and the trilingual quality package.

## References

- Product vision (PROD-VISION-001): [product-vision-and-deployment.md](product-vision-and-deployment.md)
- Dual deployment and fiscal modularity: [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md)
- SuperAdmin bootstrap and RBAC (seed, env): [superadmin-bootstrap-and-rbac.md](superadmin-bootstrap-and-rbac.md)
- Cursor plan → GitHub Issues / Project sync (`plan:sync`): [cursor-plan-github-sync.md](cursor-plan-github-sync.md)
- CI/CD: [ci-cd.md](ci-cd.md)
- Complementary technical backlog (not a substitute for this index): [10-plan-implementaciones-futuras-bizcode.md](../../referencias/10-plan-implementaciones-futuras-bizcode.md)

## Phase index (master plan)

| Phase | Timebox (indicative) | Focus |
|-------|----------------------|--------|
| **0** | Weeks 1–2 | Project governance, documentation map, Definition of Ready/Done, no scope without backlog + acceptance criteria |
| **1** | Weeks 3–6 | IAM foundation: roles and permissions in code, sessions, audit events, authorization on REST routes documented in OpenAPI |
| **2** | Weeks 7–10 | Operational flow **design** for wholesale/retail: order → logistics → delivery → collection (domain `pedido` not yet required in Prisma) |
| **3** | Weeks 11–13 | Stability, tests by criticality, minimal observability on auditable events, MVP exit criteria for pilots |

## Governance package

### Definition of Ready (DoR)

- A backlog item exists with a **verifiable** acceptance criterion (test command, file path, OpenAPI path, or documented behavior).
- Dependencies and scope are explicit (no hidden coupling with fiscal modules per ADR-0007).

### Definition of Done (DoD)

- Automated checks relevant to the change pass locally (`npm run test`, `npm run lint`, `npm run type-check` as applicable).
- If behavior, API, or UI changes: update **three locales** under `docs/` per [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md) and OpenAPI when HTTP contract changes.
- Documentation remains faithful to the code (no invented endpoints or tables).

### Implementation rule

**No implementation** without a backlog item linked to a **verifiable** acceptance criterion and evidence in the repo (tests, contract, or docs aligned with code).

## Backlog P0 / P1 (~90 days)

Priorities below are **planning** items; verification is against the repository at merge time.

| ID | Priority | Item | Verifiable acceptance criterion |
|----|----------|------|--------------------------------|
| BP0-1 | P0 | Trilingual execution package (this doc + RBAC matrix + IAM + order-flow design) | Files exist under `docs/en|es|pt-br/quality/` per [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md); `npm run check:docs-map` passes |
| BP0-2 | P0 | RBAC source of truth documented | Matrix matches `ROLE_PERMISSIONS` in [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) |
| BP0-3 | P0 | IAM and sessions documented | Describes `Tenant`, `AppUser`, `AppSession`, `AuditEvent` in [`prisma/schema.prisma`](../../../prisma/schema.prisma) and flow in [`server/auth.ts`](../../../server/auth.ts) |
| BP0-4 | P0 | Auth on domain API | Routes under `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/facturas`, `/api/formas-pago` use `requirePermission` in [`server/createApp.ts`](../../../server/createApp.ts); contract in [`docs/api/openapi.yaml`](../../api/openapi.yaml) |
| BP1-1 | P1 | Order (`pedido`) domain | **Future:** Prisma model + migration + routes only when specified in OpenAPI and implemented in `server/` |
| BP1-2 | P1 | E2E / integration coverage for critical paths | Align with [testing-strategy.md](testing-strategy.md) and existing Playwright/Postgres tooling |
| BP1-3 | P1 | Channel scope enforcement | **Not evidenced in current codebase:** no `x-bizcode-channel` handling in `server/auth.ts` or `server/createApp.ts`; `tests/server/scope-channel.test.ts` is **not present**. Acceptance when implemented: middleware or equivalent uses `AuthScope.channels` from [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) and tests prove it |

## Repository status vs this package

| Topic | English document |
|-------|------------------|
| RBAC matrix (roles → permissions, channels) | [rbac-matrix-roles-permissions-scopes.md](rbac-matrix-roles-permissions-scopes.md) |
| IAM (data model, sessions, audit) | [iam-model-sessions-audit.md](iam-model-sessions-audit.md) |
| Operational flow order → delivery → collection (design) | [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md) |

Spanish and Portuguese counterparts are linked from the same logical rows in [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).
