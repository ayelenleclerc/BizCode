# Changelog

Todas as mudanças notáveis do BizCode são documentadas aqui.
Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento: [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Adicionado

- **Pricing e trials de módulos SuperAdmin (GitHub #226):** `GET /api/superadmin/tenants/:id/pricing`, `GET/POST/DELETE .../trials`; modelo `TenantModuleTrial`; `src/lib/modules/pricing.ts`, `TenantPricingService`, `TenantTrialService`; `npm run modules:trial-expire`; notificação `module_trial_expiring`; UI pricing/trial em `/superadmin/tenants/:id/modules`; OpenAPI e testes API; i18n EN/ES/PT-BR (sync billing adiado para #181).

- **UI de módulos SuperAdmin (GitHub #225):** página `/superadmin/tenants/:id/modules` com toggles, motivo obrigatório, modelos e histórico; clientes `superadminAPI` (config) e `modulesCatalogAPI` em `src/lib/api.ts`; testes `TenantModulesPage.test.tsx`; i18n `common.superadmin.modules.*` (EN/ES/PT-BR).

- **Painel SuperAdmin multi-tenant (GitHub #137):** API `GET/POST/PATCH /api/superadmin/tenants`, `GET /api/superadmin/tenants/:id`, `GET /api/superadmin/stats` com `requireSuperAdmin` e `platform.tenants.manage`; serviço `SuperadminTenantService`; UI `/superadmin` (lista, detalhe, suspender/reativar) e link placeholder para módulos (`#225`); OpenAPI e `tests/api/superadmin-tenants.test.ts`; i18n EN/ES/PT-BR em `common.superadmin.*`.

- **Feature flags no frontend (GitHub #224):** `FeatureFlagsContext` / `useFeatureFlags`; `GET /api/me/features` via `featuresAPI`; `IfModule`, `ModuleRoute`, `FeatureFlagsGate`; nav e rotas condicionais (`navSections.ts`, `Layout`, `App.tsx`); alerta acessível em `/inicio`; i18n `modules.*`; testes em `FeatureFlagsContext.test.tsx`, `IfModule.test.tsx`, `Layout.nav-modules.test.tsx`.

- **Feature flags por tenant (GitHub #223):** modelos `TenantConfig` / `TenantConfigHistory`; `GET /api/me/features`; middleware `requireModule` (ex.: `billing.orders` em `/api/pedidos`); API SuperAdmin `GET/PUT /api/superadmin/tenants/:id/config`, histórico e `POST .../apply-template`; `TenantConfig` no `setup-owner` e seed; cache em processo (sem Redis); i18n `errors.moduleNotEnabled`; testes em `tests/api/me-features.test.ts`, `tests/api/superadmin-tenant-config.test.ts`, `tests/server/require-module.test.ts`.

### Corrigido

- **Filtros de cobranças (a11y):** campos de filtro em `/cobros` com rótulo visível e `aria-label` / `placeholder`; [`src/pages/cobros/index.tsx`](../../src/pages/cobros/index.tsx).

- **CORS + cookie de sessão:** `cors` no Express usa `credentials: true` e allowlist de origens (`http://localhost:5173`, `http://127.0.0.1:5173`, mais `CORS_ORIGINS` em CSV) para o SPA (Axios `withCredentials`) receber e enviar cookies de sessão entre origens; [`server/createApp.ts`](../../server/createApp.ts), [`.env.example`](../../.env.example), [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts); [seguranca.md](seguranca.md) atualizado.

### Adicionado

- **Ordens de compra (GitHub #135):** `OrdenCompra` + `OrdenCompraItem`; CRUD `/api/compras`, `POST .../send`, `POST .../receive` (recebimento parcial → `StockAjuste` motivo `compra`); UI `/compras`; RBAC `suppliers.read` / `suppliers.manage` + `inventory.adjust` na recepção; i18n EN/ES/PT-BR.
- **Lembretes de inadimplência (GitHub #134):** modelo `CobroRecordatorio`; `ParamEmpresa.recordatorioDiasGracia`; `GET /api/cobranzas/vencidas` e `POST /api/cobranzas/recordatorios` (`reports.financial.read`); `CobranzasService` + job `npm run cobranzas:recordatorios`; seção em `/finanzas`; auditoria `cobranza_recordatorio_send`; i18n EN/ES/PT-BR.
- **AFIP CAE (GitHub #133):** `TenantFiscalConfig`, campos CAE em `Factura`, `PUT /api/afip/config`, `POST /api/afip/auth`, `POST /api/afip/cae`; mock WSFE homologação; hook pós-criação em `FacturaService`; `npm run afip:retry-pending`. Badge PDF em follow-up.
- **Pedidos comerciais (GitHub #132):** modelos `Pedido` / `PedidoItem`; `GET/POST/PUT/DELETE /api/pedidos` e `POST .../confirm` / `POST .../invoice` (estados e rotas em inglês, ADR-0009); RBAC `orders.create` / `sales.create` / `sales.cancel`; auditoria `pedido_*`; UI de listagem `/pedidos`; i18n EN/ES/PT-BR. Gating modular: `requireModule('billing.orders')` (#223).

- **Migração DBF de catálogo (GitHub #131):** parsers `legacyRubroDbf.ts` / `legacyArticuloDbf.ts`; `POST /api/rubros/migrate-dbf` e `POST /api/articulos/migrate-dbf` (`settings.business.manage`, upsert por código); `npm run migrate:dbf` importa `RUBROS.DBF` / `ARTICULOS.DBF` quando existirem (fallback `PVAR2`/`PVAR`); fixtures e testes de integração.

- **Ajustes de estoque (GitHub #128):** modelo `StockAjuste` e migração; `POST /api/articulos/:id/stock-ajuste` (`inventory.adjust`) e `GET /api/articulos/:id/stock-historial`; ao criar fatura decrementa estoque e notifica `stock_below_minimum`; auditoria `stock_adjust`; i18n EN/ES/PT-BR.

- **Documentação (sincronização ISO-ready):** pacote specs v0.2 (RF-011–RF-015); manuais de cobranças, finanças, relatórios e logística (EN/ES/PT-BR); fluxo operacional MVP; rastreabilidade ISO e stubs REQ-007, TST-003, TST-005, ARC-004; pós-processamento TypeDoc [`scripts/patch-typedoc-html-noopener.mjs`](../../scripts/patch-typedoc-html-noopener.mjs); [`DOCUMENT_LOCALE_MAP.md`](../DOCUMENT_LOCALE_MAP.md).
- **Configuração da empresa (GitHub #127):** `ParamEmpresa` por tenant com `GET/PUT /api/empresa`; `puntoVenta` define `prefijoFactura` de 4 dígitos; UI em `/configuracion/empresa` (edição com `settings.business.manage`); formulário de nova fatura pré-preenche prefixo e tipo padrão; i18n EN/ES/PT-BR.
- **Score de pagamento (GitHub #130):** Recálculo automático de `Cliente.score` em `POST /api/cobros` pelos dias em atraso vs fatura ativa mais antiga (+5 / −3 / −7 / −15); sem alteração sem fatura ativa; `metadata` de auditoria com `scoreBefore`, `scoreAfter`, `delta`; resposta inclui `updatedCliente`; tooltip na ficha do cliente; i18n EN/ES/PT-BR.
- **Ordens de entrega (GitHub #126):** modelo `OrdenEntrega` e migração; API `GET/POST/PUT /api/ordenes-entrega` com RBAC; listagem restrita ao motorista; auditoria em mudanças de status (`entrega_confirmed`); UI `/logistica` planner e motorista; i18n EN/ES/PT-BR.
- **Relatórios (GitHub #129):** Relatórios operacionais em `/reportes` — `GET /api/reportes/ventas`, `GET /api/reportes/stock-critico`, `GET /api/reportes/cobranzas` com exportação JSON ou `Accept: text/csv`; permissões `reports.operational.read` / `reports.financial.read`; i18n EN/ES/PT-BR.
- **Finanças (GitHub #125):** Módulo real em `/finanzas` — `GET /api/reportes/aging` e `GET /api/reportes/cuenta-corriente/:clienteId` (aging por `creditDays`, extrato com saldo acumulado); `facturasVencidas` do dashboard com a mesma regra de vencimento; i18n EN/ES/PT-BR.

- **Cobranças (GitHub #124):** Registro de pagamentos de clientes — modelo `Cobro`, API REST (`POST/GET /api/cobros`), UI `/cobros`, recebimentos recentes na ficha do cliente, widget `cobrosHoy` do dashboard com dados reais; i18n EN/ES/PT-BR.

- **Backend (GitHub #79):** importação CSV usa os mesmos esquemas Zod `*BodySchema` que o corpo JSON do REST (`safeParseBodySchema` em [`server/schemas/domain.ts`](../../server/schemas/domain.ts)); restrições **CHECK** no PostgreSQL para `Articulo.stock`, `Articulo.minimo` e `Cliente.creditLimit` (migração `prisma/migrations/20260505130000_nonneg_entity_checks`); documentação em [padroes-codigo.md](padroes-codigo.md) e [`.cursor/rules/backend-standards.mdc`](../../.cursor/rules/backend-standards.mdc); manuais do usuário citam erros de importação com nome do campo.
- **Gestão de usuários (issue #25):** `GET/POST /api/users`, `PUT /api/users/:id`, `POST /api/auth/change-password`; página Usuários (`src/pages/users/`) com DataTable + modal criação/edição, atalhos de teclado (F2/F3/F5/Esc), restrição de hierarquia de perfis; componente `<CanAccess permission="..." />` para renderização condicional por permissão; link na sidebar visível somente para titulares de `users.manage`; i18n em EN/ES/PT-BR; 17 novos testes de integração; OpenAPI atualizado; docs trilingues em `docs/*/quality/`.

### Added

- **Fluxo de arquivamento na aprovação de planos:** novo comando `npm run plan:approve -- --plan <arquivo>` que salva planos aprovados em `.cursor/plans/{timestamp}-{slug}.plan.md` e depois executa o fluxo existente `plan:sync` (Issues/Project v2 no GitHub); `plan:sync` continua disponível para sincronização manual/direta.
- **UX de autenticacao + bootstrap seguro:** tela de login com guard de rotas/logout ligada a `/api/auth/login|me|logout`, suporte de cookie de sessao em [`src/lib/api.ts`](../../src/lib/api.ts), provider em [`src/auth/AuthProvider.tsx`](../../src/auth/AuthProvider.tsx), e comando `npm run bootstrap:superadmin` para criar super admin (senha via `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`, sem credencial hardcoded) por [`scripts/bootstrap-superadmin.ts`](../../scripts/bootstrap-superadmin.ts).
- **Visão de produto e governança:** documento trilíngue [visao-produto-e-implantacao.md](quality/visao-produto-e-implantacao.md) (PROD-VISION-001) · [en](../en/quality/product-vision-and-deployment.md) · [es](../es/quality/vision-producto-y-despliegue.md); [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (desktop/SaaS + modularidade fiscal); linha em [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); [AGENTS.md](../../AGENTS.md) e [`.cursor/rules/product-vision.mdc`](../../.cursor/rules/product-vision.mdc); matriz [rastreabilidade-iso.md](certificacion-iso/rastreabilidade-iso.md); links na arquitetura
- **Documentação (pacote ISO):** [Certificación-ISO/README.md](../../Certificación-ISO/README.md) como ponto de entrada; manual do SGQ, matriz de rastreabilidade ISO, modelos de registros e ciclo de vida documental em `docs/{en,es,pt-br}/certificacion-iso/` (fonte única); [indice-pacote-iso.md](certificacion-iso/indice-pacote-iso.md) (ISO-PKG-001); stubs em [`docs/quality/`](../quality/); estratégia de testes / CI/CD / plano Swagger permanecem em `docs/*/quality/`; **SBOM:** `@cyclonedx/cyclonedx-npm`, `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json) (SBOM-001), [`docs/evidence/README.md`](../evidence/README.md)
- **API:** **Swagger UI** em `http://localhost:3001/api-docs/` (`swagger-ui-express`, [`server/createApp.ts`](../../server/createApp.ts), OpenAPI em [`openapi.yaml`](../api/openapi.yaml)); [`tests/api/swagger-ui.test.ts`](../../tests/api/swagger-ui.test.ts); dependência runtime `yaml`; `info.description` do OpenAPI atualizado
- **Documentação:** plano trilíngue **Swagger / OpenAPI UI** (versão **1.0.0**): [plano-swagger-openapi-ui.md](quality/plano-swagger-openapi-ui.md) · [en](../en/quality/swagger-openapi-ui-plan.md) · [es](../es/quality/plan-swagger-openapi-ui.md); [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) atualizado; [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc) (subseção contrato API), [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md); `.cursor/plans/` no `.gitignore` (cópia canônica em `docs/`); linha em [rastreabilidade-iso.md](certificacion-iso/rastreabilidade-iso.md)
- **Toolchain:** Node **22 LTS** no CI, [`.nvmrc`](../../.nvmrc), `engines` em [`package.json`](../../package.json) (**≥ 22**); [`.npmrc`](../../.npmrc) `legacy-peer-deps` para `npm ci` com ESLint 10 + jsx-a11y
- **Documentação gerada:** `npm run docs:generate` — TypeDoc → `docs/generated/typedoc/`, `@scalar/openapi-to-markdown` → [`openapi-reference.generated.md`](../api/openapi-reference.generated.md), `@adobe/jsonschema2md` (esquemas extraídos do OpenAPI) → `docs/generated/schema-md/`, `sbom:generate` → [`sbom-cyclonedx.json`](../evidence/sbom-cyclonedx.json); CI executa `docs:generate` e depois `git diff` nas rotas geradas; guia trilíngue [documentacao-gerada.md](quality/documentacao-gerada.md); [`.cursor/rules/doc-generation.mdc`](../../.cursor/rules/doc-generation.mdc)
- **Dependências:** **Vite 6**, `@vitejs/plugin-react` 5.x, **Prisma 5.22**; `@types/node` 22; avisos de audit remanescentes ligados ao CLI `npm` empacotado (apenas tooling de desenvolvimento)
- **ADR-0005** — [Cobertura Vitest para `server.ts`](adr/ADR-0005-vitest-coverage-server-bootstrap.md): refactor de bootstrap, entrada `server/main.ts`, `tests/server/server.test.ts`
- **ADR-0006** — [CI opcional: semantic-release e Tauri self-hosted](adr/ADR-0006-release-and-tauri-ci-workflows.md): `npm audit` informativo no CI; `release.config.cjs`, `release.yml`, `tauri-selfhosted.yml`
- **CI:** `npm audit --audit-level=high` não bloqueante após `npm ci`
- **JSDoc trilíngue** em `calculateInvoice`, `calculateItemSubtotal` e cabeçalho do módulo em [`src/lib/invoice.ts`](../../src/lib/invoice.ts); `createApp` em [`server/createApp.ts`](../../server/createApp.ts)
- **ADR-0004** — [smoke E2E Playwright e roteiro de integração](adr/ADR-0004-e2e-playwright-integration-roadmap.md): `e2e/smoke.spec.ts`, `playwright.config.ts`, CI instala Chromium e executa `npm run test:e2e`; Vitest exclui `e2e/**`; **fase B:** `tests/integration/`, `npm run test:integration`, `vitest.integration.config.ts`; CI executa `prisma migrate deploy` e depois integração (Prisma real; contrato API continua com mock)
- **Ciclo de vida documental e validação** (qualidade): [ciclo-vida-e-validacao-documental.md](certificacion-iso/ciclo-vida-e-validacao-documental.md); `npm run check:docs-map` verifica caminhos no [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI executa após paridade i18n
- **JSDoc trilíngue** de exemplo em `validateCUIT` em [`src/lib/validators.ts`](../../src/lib/validators.ts) (ver [padroes-codigo.md](padroes-codigo.md))
- **Nomes de arquivo localizados por idioma (fase 3):** a documentação em `docs/en/`, `docs/es/` e `docs/pt-br/` usa **nomes distintos por árvore**; mapa canônico em [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); ADRs mantêm o **mesmo slug técnico** em cada idioma
- **Especificações MVP ISO-ready** em [`specs/`](specs/indice.md): manual técnico (índice), RF/RNF, casos de uso, histórias e critérios, casos de teste manual (TC-001–TC-010), matriz de rastreabilidade — apenas **evidência** do repositório; espelhos em [inglês](../en/specs/index.md) e [espanhol](../es/specs/indice.md); [rastreabilidade-iso.md](certificacion-iso/rastreabilidade-iso.md) atualizado
- Regras do projeto no Cursor: [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc), [`.cursor/rules/bizcode-documentation.mdc`](../../.cursor/rules/bizcode-documentation.mdc); [AGENTS.md](../../AGENTS.md) e [CONTRIBUTING.md](../../CONTRIBUTING.md) exigem conformidade; convenção JSDoc trilíngue em [padroes-codigo.md](padroes-codigo.md)
- Documentação do tema UI: [temas-interface.md](temas-interface.md); referências em [arquitetura.md](arquitetura.md) e [padroes-codigo.md](padroes-codigo.md)
- Documentação de produto e qualidade em **inglês**, **espanhol** e **português brasileiro** (`docs/en/`, `docs/es/`, `docs/pt-br/`); hub [README.md](../README.md); política [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md); stubs na raiz de `docs/` redirecionam para cada idioma
- Vitest 4, ESLint 10, react-i18next (es, en, pt-BR), `check:i18n`, GitHub Actions, acessibilidade WCAG 2.2 AA

### Changed

- **Segurança / setup:** [`.env.example`](../../.env.example) não inclui mais credenciais de exemplo do banco nem literal de senha de seed padrão; `npx prisma db seed` **exige** `BIZCODE_SEED_SUPERADMIN_PASSWORD` no `.env` (≥ 8 caracteres). Ver [seguranca.md](seguranca.md), [superadmin-bootstrap-e-rbac.md](quality/superadmin-bootstrap-e-rbac.md) e [README.md](../../README.md).
- Documentação: manuais de usuário (`docs/pt-br/user/`) alinhados ao inglês; `certificacion-iso/modelos-registros.md` completo (sessão de teste manual com tabela); `glossario.md` ampliado; título do índice ADR em português
- Glossário e [mapa-dados-pessoais.md](mapa-dados-pessoais.md): autoridade fiscal argentina como **ARCA** (ex-AFIP); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) e [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) descrevem **nomes de arquivo localizados** por árvore (ADRs com o mesmo slug nos três idiomas)

### Fixed

- Tema claro/escuro: removido `class="dark"` fixo no `<body>` do `index.html`; ver [temas-interface.md](temas-interface.md)

---

## [0.1.0] — 2026-01-01

### Added

- Gestão de clientes, artigos, faturamento (A/B), atalhos de teclado, tema Tailwind, Tauri 1.5, Express 5 + Prisma + PostgreSQL

**Outros idiomas:** [English](../en/changelog.md) · [Español](../es/historial-de-cambios.md)
