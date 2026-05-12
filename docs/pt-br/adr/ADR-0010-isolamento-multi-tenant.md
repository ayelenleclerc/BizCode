# ADR-0010: Isolamento de dados multi-tenant

**Status:** Aceito  
**Data:** 2026-05-12  
**Referência ISO:** ISO/IEC 27001:2022 A.5.15 (controle de acesso); ISO 9001:2015 cláusula 8.5.1 (operações controladas)

---

## Contexto

O BizCode persiste dados de negócio em PostgreSQL com coluna `tenantId` em modelos com escopo de tenant (ver esquema Prisma). A API usa **sessão por cookie** e `AuthClaims.tenantId` de [`server/auth.ts`](../../../server/auth.ts), não tokens JWT de acesso. A issue #75 exige que cada handler autenticado limite leituras e gravações ao tenant do chamador.

## Decisão

1. Após `resolveSession`, [`server/middleware/tenantContext.ts`](../../../server/middleware/tenantContext.ts) copia `req.auth.claims.tenantId` para `req.tenantId` quando há sessão e o id é inteiro positivo.
2. Handlers REST obtêm o tenant ativo via [`getTenantId`](../../../server/routes/restDomainShared.ts) (prioriza `req.tenantId`, fallback para claims).
3. **Regra:** consultas Prisma de entidades por tenant devem incluir `tenantId` em `where` em leituras e em `data` em criações; atualizações e exclusões devem verificar posse com `{ id, tenantId }` antes de mutar.
4. Serviços de domínio (`ClienteService`, `ArticuloService`, `FacturaService`, `ImportService`, etc.) recebem `tenantId` explícito das rotas — sem filtro global de tenant em middleware Prisma.
5. **Exceções:** `/api/health`, bootstrap/login de auth e rotas não autenticadas não anexam contexto de tenant; linhas de auditoria continuam registrando `tenantId` da sessão quando existir.

## Consequências

- **Positivo:** Fonte única de tenant por requisição; a suíte de testes pode afirmar `where.tenantId` em mocks Prisma; alinhado ao SaaS em [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md).
- **Negativo:** Cada rota nova deve continuar passando `tenantId` explicitamente; erros são detectados por revisão e testes API, não por filtro ORM automático.
- **Testes:** [`tests/api/tenant-isolation.test.ts`](../../../../tests/api/tenant-isolation.test.ts) e suítes API relacionadas.

## Referências

- [ADR-0007: Implantação dual e modularidade fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
