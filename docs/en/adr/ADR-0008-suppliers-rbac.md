# ADR-0008: RBAC for suppliers (Proveedor)

**Status:** Accepted  
**Date:** 2026-04-17  
**ISO reference:** ISO/IEC 27001:2022 A.5.15 (access control); ISO 9001:2015 §8.5.1 (controlled operations)

---

## Context

The product added a **Proveedor** (supplier) master with list/detail, CRUD, and CSV import. Permissions could have been folded into **`products.manage`** (same as articles/rubros) to minimise RBAC surface, or split into **supplier-specific** permissions for clearer least-privilege (e.g. purchasing vs catalogue staff).

## Decision

1. Introduce **`suppliers.read`** for `GET /api/proveedores` and `GET /api/proveedores/:id`.
2. Introduce **`suppliers.manage`** for create/update and for **CSV import** (`/api/proveedores/import/*`).
3. Do **not** reuse **`products.manage`** for supplier writes or import, so catalogue-only roles are not implicitly allowed to maintain suppliers.

Role assignment is defined in [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts) (same file as other permissions).

## Consequences

- **Positive:** Clear separation between product catalogue and supplier master; import and CRUD are auditable under one management permission.
- **Negative:** More permissions to assign; roles that need both must receive both `products.*` and `suppliers.*` where applicable.
- **API:** OpenAPI tags and routes under `/api/proveedores` must stay aligned with this matrix; contract tests cover envelopes.

## References

- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml) (`proveedores` paths)
