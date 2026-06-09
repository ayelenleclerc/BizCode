# HTTP mutations → AuditEvent mapping (issue #84)

Canonical matrix (Spanish, audit-ready wording): **[matriz en español](../es/quality/matriz-auditoria-mutaciones-http.md)**.

Automated parity: [`tests/server/http-mutations-audit-coverage.test.ts`](../../../tests/server/http-mutations-audit-coverage.test.ts).

## Audit log query (#67)

Operators with permission `audit.read` can retrieve a paginated list via **GET** `/api/audit-events` (filters and pagination are described in the OpenAPI contract) and review events in the web app at **`/admin/audit-log`**.

**Other languages:** [Español](../es/quality/matriz-auditoria-mutaciones-http.md) · [Português](../pt-br/quality/audit-http-mutations-matrix.md)
