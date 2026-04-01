# Changelog

Todas as mudanças notáveis do BizCode são documentadas aqui.
Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento: [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

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

- Documentação: manuais de usuário (`docs/pt-br/user/`) alinhados ao inglês; `certificacion-iso/modelos-registros.md` completo (sessão de teste manual com tabela); `glossario.md` ampliado; título do índice ADR em português
- Glossário e [mapa-dados-pessoais.md](mapa-dados-pessoais.md): autoridade fiscal argentina como **ARCA** (ex-AFIP); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) e [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) descrevem **nomes de arquivo localizados** por árvore (ADRs com o mesmo slug nos três idiomas)

### Fixed

- Tema claro/escuro: removido `class="dark"` fixo no `<body>` do `index.html`; ver [temas-interface.md](temas-interface.md)

---

## [0.1.0] — 2026-01-01

### Added

- Gestão de clientes, artigos, faturamento (A/B), atalhos de teclado, tema Tailwind, Tauri 1.5, Express 5 + Prisma + PostgreSQL

**Outros idiomas:** [English](../en/changelog.md) · [Español](../es/historial-de-cambios.md)
