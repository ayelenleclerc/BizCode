# Plano mestre BizCode — índice de execução

Este documento é um **índice executável** do plano mestre BizCode (horizonte ~180 dias com **marcos ~90 dias**). Não substitui o arquivo de plano no Cursor; liga evidências do repositório e o pacote trilíngue de qualidade.

## Referências

- Visão de produto (PROD-VISION-001): [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md)
- Implantação dual e modularidade fiscal: [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md)
- Bootstrap SuperAdmin e RBAC (seed, env): [superadmin-bootstrap-e-rbac.md](superadmin-bootstrap-e-rbac.md)
- Plano Cursor → GitHub Issues / Project (`plan:sync`): [sincronizacao-plano-cursor-github.md](sincronizacao-plano-cursor-github.md)
- CI/CD: [ciclo-ci-cd.md](ciclo-ci-cd.md)
- Backlog técnico complementar (não substitui este índice): [10-plan-implementaciones-futuras-bizcode.md](../../referencias/10-plan-implementaciones-futuras-bizcode.md)

## Índice de fases (plano mestre)

| Fase | Janela (indicativa) | Foco |
|------|---------------------|------|
| **0** | Semanas 1–2 | Governança do projeto, mapa documental, DoR/DoD, sem escopo sem backlog + critério de aceitação |
| **1** | Semanas 3–6 | Base IAM: papéis e permissões no código, sessões, auditoria, autorização em rotas REST documentadas no OpenAPI |
| **2** | Semanas 7–10 | **Desenho** operacional atacado/varejo: pedido → logística → entrega → cobrança (domínio `pedido` ainda não obrigatório no Prisma) |
| **3** | Semanas 11–13 | Estabilidade, testes por criticidade, observabilidade mínima em eventos auditáveis, critérios de saída do MVP para pilotos |

## Pacote de governança

### Definition of Ready (DoR)

- Item de backlog com critério de aceitação **verificável** (comando de teste, caminho de arquivo, path OpenAPI ou comportamento documentado).
- Dependências e escopo explícitos (sem acoplamento oculto com módulos fiscais conforme ADR-0007).

### Definition of Done (DoD)

- Passam as verificações automáticas pertinentes (`npm run test`, `npm run lint`, `npm run type-check` conforme aplicável).
- Se mudar comportamento, API ou UI: atualizar **três locales** em `docs/` segundo [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md) e OpenAPI se o contrato HTTP mudar.
- A documentação permanece fiel ao código (sem endpoints ou tabelas inventados).

### Regra de implementação

**Sem implementação** sem item de backlog ligado a critério de aceitação **verificável** e evidência no repositório (testes, contrato ou docs alinhados ao código).

## Backlog P0 / P1 (~90 dias)

As prioridades abaixo são itens de **planejamento**; a verificação é contra o repositório no momento do merge.

| ID | Prioridade | Item | Critério de aceitação verificável |
|----|------------|------|-----------------------------------|
| BP0-1 | P0 | Pacote trilíngue de execução (este doc + matriz RBAC + IAM + desenho de fluxo pedido) | Arquivos em `docs/en|es|pt-br/quality/` conforme [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md); `npm run check:docs-map` OK |
| BP0-2 | P0 | RBAC documentado como fonte da verdade | A matriz coincide com `ROLE_PERMISSIONS` em [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) |
| BP0-3 | P0 | IAM e sessões documentados | Descreve `Tenant`, `AppUser`, `AppSession`, `AuditEvent` em [`prisma/schema.prisma`](../../../prisma/schema.prisma) e o fluxo em [`server/auth.ts`](../../../server/auth.ts) |
| BP0-4 | P0 | Auth na API de domínio | Rotas sob `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/facturas`, `/api/formas-pago` usam `requirePermission` ao serem registradas em [`server/registerRestDomainRoutes.ts`](../../../server/registerRestDomainRoutes.ts) (módulos em `server/routes/`); composição da app em [`server/createApp.ts`](../../../server/createApp.ts); contrato em [`docs/api/openapi.yaml`](../../api/openapi.yaml) |
| BP1-1 | P1 | Domínio pedido (`pedido`) | **Futuro:** modelo Prisma + migração + rotas apenas quando constarem no OpenAPI e em `server/` |
| BP1-2 | P1 | Cobertura E2E / integração de fluxos críticos | Alinhado a [estrategia-testes.md](estrategia-testes.md) e ferramentas Playwright/Postgres existentes |
| BP1-3 | P1 | Enforcement de escopo por canal | **Implementado no código atual:** `requirePermission` em [`server/auth.ts`](../../../server/auth.ts) valida `x-bizcode-channel` opcional contra `AuthScope.channels`; cabeçalho inválido retorna `400` e canal fora do escopo retorna `403`. Coberto por [`tests/server/scope-channel.test.ts`](../../../tests/server/scope-channel.test.ts) |
| BP1-4 | P1 | Chat interno (escopo mínimo) | Implementado com `/api/chat/conversations`, `/api/chat/messages`, contador de não lidas via `Notification` (`chat_message`), histórico paginado e rota de UI `/chat` em `src/pages/chat/index.tsx` |
| BP1-5 | P1 | Preparação ETL de clientes DBF (#51) | Levantamento documentado em `scripts/MIGRACION_PROGRAMA_VIEJO.md` (mapeamento explícito `COND`/`BAJA`/`CREDITO` e política de rejeição); sem implementação produtiva do ETL de clientes nesta fase |

## Estado do repositório vs este pacote

| Tema | Documento em português (BR) |
|------|-----------------------------|
| Matriz RBAC (papéis → permissões, canais) | [matriz-rbac-funcoes-permissoes-scopes.md](matriz-rbac-funcoes-permissoes-scopes.md) |
| IAM (modelo de dados, sessões, auditoria) | [modelo-iam-sessoes-auditoria.md](modelo-iam-sessoes-auditoria.md) |
| Fluxo operacional pedido → entrega → cobrança (desenho) | [fluxo-operacional-pedido-entrega-cobranca.md](fluxo-operacional-pedido-entrega-cobranca.md) |

Os equivalentes em inglês e espanhol estão nas mesmas linhas lógicas de [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).
