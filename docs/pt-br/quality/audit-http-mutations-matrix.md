# Mapeamento mutações HTTP → AuditEvent (#84)

Matriz autoritativa (espanhol): **[matriz-auditoria-mutaciones-http](../es/quality/matriz-auditoria-mutaciones-http.md)**.

Testes: [`tests/server/http-mutations-audit-coverage.test.ts`](../../../tests/server/http-mutations-audit-coverage.test.ts).

## Consulta ao registro de auditoria (#67)

Operadores com permissão `audit.read` podem listar eventos paginados via **GET** `/api/audit-events` (filtros e paginação no contrato OpenAPI) e revisá-los na aplicação em **`/admin/audit-log`**.

**Outros idiomas:** [English](../en/quality/audit-http-mutations-matrix.md) · [Español](../es/quality/matriz-auditoria-mutaciones-http.md)
