# Changelog

Todas as mudanças notáveis do BizCode são documentadas aqui.
Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento: [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- **Ciclo de vida documental e validação** (qualidade): [ciclo-vida-e-validacao-documental.md](quality/ciclo-vida-e-validacao-documental.md); `npm run check:docs-map` verifica caminhos no [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); CI executa após paridade i18n
- **JSDoc trilíngue** de exemplo em `validateCUIT` em [`src/lib/validators.ts`](../../src/lib/validators.ts) (ver [padroes-codigo.md](padroes-codigo.md))
- **Nomes de arquivo localizados por idioma (fase 3):** a documentação em `docs/en/`, `docs/es/` e `docs/pt-br/` usa **nomes distintos por árvore**; mapa canônico em [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md); ADRs mantêm o **mesmo slug técnico** em cada idioma
- **Especificações MVP ISO-ready** em [`specs/`](specs/indice.md): manual técnico (índice), RF/RNF, casos de uso, histórias e critérios, casos de teste manual (TC-001–TC-010), matriz de rastreabilidade — apenas **evidência** do repositório; espelhos em [inglês](../en/specs/index.md) e [espanhol](../es/specs/indice.md); [rastreabilidade-iso.md](quality/rastreabilidade-iso.md) atualizado
- Regras do projeto no Cursor: [`.cursor/rules/bizcode.mdc`](../../.cursor/rules/bizcode.mdc), [`.cursor/rules/bizcode-documentation.mdc`](../../.cursor/rules/bizcode-documentation.mdc); [AGENTS.md](../../AGENTS.md) e [CONTRIBUTING.md](../../CONTRIBUTING.md) exigem conformidade; convenção JSDoc trilíngue em [padroes-codigo.md](padroes-codigo.md)
- Documentação do tema UI: [temas-interface.md](temas-interface.md); referências em [arquitetura.md](arquitetura.md) e [padroes-codigo.md](padroes-codigo.md)
- Documentação de produto e qualidade em **inglês**, **espanhol** e **português brasileiro** (`docs/en/`, `docs/es/`, `docs/pt-br/`); hub [README.md](../README.md); política [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md); stubs na raiz de `docs/` redirecionam para cada idioma
- Vitest 4, ESLint 10, react-i18next (es, en, pt-BR), `check:i18n`, GitHub Actions, acessibilidade WCAG 2.2 AA

### Changed

- Documentação: manuais de usuário (`docs/pt-br/user/`) alinhados ao inglês; `quality/modelos-registros.md` completo (sessão de teste manual com tabela); `glossario.md` ampliado; título do índice ADR em português
- Glossário e [mapa-dados-pessoais.md](mapa-dados-pessoais.md): autoridade fiscal argentina como **ARCA** (ex-AFIP); [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) e [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) descrevem **nomes de arquivo localizados** por árvore (ADRs com o mesmo slug nos três idiomas)

### Fixed

- Tema claro/escuro: removido `class="dark"` fixo no `<body>` do `index.html`; ver [temas-interface.md](temas-interface.md)

---

## [0.1.0] — 2026-01-01

### Added

- Gestão de clientes, artigos, faturamento (A/B), atalhos de teclado, tema Tailwind, Tauri 1.5, Express 5 + Prisma + PostgreSQL

**Outros idiomas:** [English](../en/changelog.md) · [Español](../es/historial-de-cambios.md)
