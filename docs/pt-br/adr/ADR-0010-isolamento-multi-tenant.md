# ADR-0010: Isolamento de dados multi-tenant

**Status:** Aceito (emendado 2026-07-27, #215)  
**Data:** 2026-05-12  
**Referência ISO:** ISO/IEC 27001:2022 A.5.15 (controle de acesso); ISO 9001:2015 cláusula 8.5.1 (operações controladas)

---

## Contexto

O BizCode persiste dados de negócio em PostgreSQL com coluna `tenantId` (`Int`, não UUID) em modelos com escopo de tenant (ver esquema Prisma). A API usa **sessão por cookie** e `AuthClaims.tenantId` de [`server/auth.ts`](../../../server/auth.ts), não tokens JWT de acesso. A issue #75 exige que cada handler autenticado limite leituras e gravações ao tenant do chamador. A issue #215 adiciona **FORCE ROW LEVEL SECURITY** no PostgreSQL como segunda linha de defesa (anti-IDOR / isolamento SaaS), sem substituir os filtros da aplicação.

## Decisão

1. Após `resolveSession`, [`server/middleware/tenantContext.ts`](../../../server/middleware/tenantContext.ts) copia `req.auth.claims.tenantId` para `req.tenantId` quando há sessão e o id é inteiro positivo. [`tenantRlsContext`](../../../apps/server/middleware/tenantRlsContext.ts) liga esse id ao AsyncLocalStorage para helpers RLS.
2. Handlers REST obtêm o tenant ativo via [`getTenantId`](../../../server/routes/restDomainShared.ts) (prioriza `req.tenantId`, fallback para claims).
3. **Regra (aplicação — continua obrigatória):** consultas Prisma de entidades por tenant devem incluir `tenantId` em `where` em leituras e em `data` em criações; atualizações e exclusões devem verificar posse com `{ id, tenantId }` antes de mutar. Rotas `:id` de alto tráfego também usam [`verifyOwnership`](../../../apps/server/middleware/verifyOwnership.ts) (404 se não pertencer ao tenant).
4. Serviços de domínio recebem `tenantId` explícito das rotas — **sem auto-filtro ORM que substitua `tenantId` explícito** (`$extends` do Prisma **não** injeta `where.tenantId`; apenas define o GUC do banco).
5. **Regra (banco — #215):** Nas tabelas mínimas do AC, o PostgreSQL aplica `ENABLE` + `FORCE ROW LEVEL SECURITY`. As policies comparam `"tenantId"` com `NULLIF(current_setting('app.current_tenant_id', true), '')::int`. Sem GUC / vazio → **0 linhas** (fail-safe). Em runtime define-se com `set_config(..., true)` (**LOCAL**) na mesma transação interativa ([`createTenantRlsPrisma`](../../../apps/server/lib/tenantRls.ts) / `runWithTenantRls`). Migrate/seed: role com `BYPASSRLS` ou superuser; a role da app em runtime não deve fazer bypass. Role local opcional: `bizcode_app`.
6. **Inventário RLS v1 (modelo Prisma → coluna `tenantId`):** `Factura`, `Cliente`, `Proveedor`, `Articulo`, `Pedido`, `OrdenCompra`, `StockAjuste`, `Notification`, `AuditEvent` (na issue: “AuditLog”). Filhos sem `tenantId` ficam fora de RLS direta na v1.
7. **Exceções:** rotas sem tenant no ALS veem 0 linhas em modelos RLS salvo `runWithTenantRls` com id explícito. `BIZCODE_RLS_BYPASS=true` só para helpers documentados de seed/teste — não produção.

## Consequências

- **Positivo:** Defesa em profundidade (filtro app + FORCE RLS); id de tenant por requisição no ALS; testes A↔B e `where.tenantId`; alinhado ao SaaS em [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md).
- **Negativo:** Cada rota nova deve continuar passando `tenantId`; RLS v1 cobre nove tabelas; GUC seguro exige `set_config` local à transação; URLs superuser ainda fazem bypass de RLS.
- **Testes:** [`tests/api/tenant-isolation.test.ts`](../../../../tests/api/tenant-isolation.test.ts), [`tests/api/rls-isolation.test.ts`](../../../../tests/api/rls-isolation.test.ts) e suítes API relacionadas.

## Referências

- [ADR-0007: Implantação dual e modularidade fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
- Issue #215 (RLS + anti-IDOR)
