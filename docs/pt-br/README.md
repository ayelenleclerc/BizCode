# Documentação BizCode (português brasileiro)

## Links rápidos

| Documento | Conteúdo |
|-----------|----------|
| [arquitetura.md](arquitetura.md) | Tauri, React, Express, Prisma, PostgreSQL |
| [temas-interface.md](temas-interface.md) | Tema claro/escuro: Tailwind `dark:`, `<html>`, `localStorage`, `index.html` |
| [padroes-codigo.md](padroes-codigo.md) | TypeScript, React, testes, i18n, `data-testid` |
| [acessibilidade.md](acessibilidade.md) | WCAG 2.2 AA, ESLint jsx-a11y, jest-axe |
| [estrategia-i18n.md](estrategia-i18n.md) | Locales `es`, `en`, `pt-BR`, paridade no CI |
| [seguranca.md](seguranca.md) | Ameaças, segredos, CORS, dependências |
| [mapa-dados-pessoais.md](mapa-dados-pessoais.md) | Inventário de dados pessoais |
| [glossario.md](glossario.md) | Terminologia de domínio |
| [historico-de-alteracoes.md](historico-de-alteracoes.md) | Histórico de versões (Keep a Changelog) |

## Qualidade e rastreabilidade

| Documento | Conteúdo |
|-----------|----------|
| [Certificación-ISO (raiz)](../../Certificación-ISO/README.md) | Ponto de entrada ao pacote ISO (sem duplicar corpos) |
| [certificacion-iso/indice-pacote-iso.md](certificacion-iso/indice-pacote-iso.md) | Registro mestre (ISO-PKG-001); **catálogo fechado** GOV…PROC-MAN (108 códigos) |
| [certificacion-iso/convencao-documentos-controlados.md](certificacion-iso/convencao-documentos-controlados.md) | Convenção de nomes e metadados dos stubs |
| [certificacion-iso/registro-rastreabilidade-documentos-normas.md](certificacion-iso/registro-rastreabilidade-documentos-normas.md) | Código → cláusulas indicativas (QMS-DR-001) |
| [certificacion-iso/rastreabilidade-entre-documentos.md](certificacion-iso/rastreabilidade-entre-documentos.md) | Rastreabilidade entre documentos (QMS-D2D-001) |
| [certificacion-iso/manual-qualidade.md](certificacion-iso/manual-qualidade.md) | Escopo do SGQ |
| [certificacion-iso/rastreabilidade-iso.md](certificacion-iso/rastreabilidade-iso.md) | Matriz norma → evidência no repositório |
| [quality/estrategia-testes.md](quality/estrategia-testes.md) | Pirâmide de testes, política de cobertura |
| [quality/ciclo-ci-cd.md](quality/ciclo-ci-cd.md) | Pipeline GitHub Actions |
| [certificacion-iso/modelos-registros.md](certificacion-iso/modelos-registros.md) | Modelos de não conformidade e sessão de teste |
| [certificacion-iso/ciclo-vida-e-validacao-documental.md](certificacion-iso/ciclo-vida-e-validacao-documental.md) | SemVer, changelogs, lista de validação / verificação |
| [quality/plano-swagger-openapi-ui.md](quality/plano-swagger-openapi-ui.md) | Referência versionada Swagger UI + OpenAPI; política para agentes |
| [quality/documentacao-gerada.md](quality/documentacao-gerada.md) | TypeDoc, OpenAPI→Markdown, esquemas JSON, SBOM — versionar saídas junto com mudanças de código |
| [quality/visao-produto-e-implantacao.md](quality/visao-produto-e-implantacao.md) | Direção desktop + SaaS, módulos fiscais por país, governança (PROD-VISION-001) |

## Manuais de processo (ISO-ready)

| Documento | Conteúdo |
|-----------|----------|
| [processes/indice.md](processes/indice.md) | PROC-MAN-001…010 — descrições de processo (stubs + links canônicos) |

## API e decisões

| Documento | Conteúdo |
|-----------|----------|
| [../api/openapi.yaml](../api/openapi.yaml) | Contrato OpenAPI 3 (arquivo único, não traduzido) |
| Swagger UI | `http://localhost:3001/api-docs/` com [`npm run server`](../../package.json) em execução (mesmo spec que `openapi.yaml`) |
| [adr/README.md](adr/README.md) | Índice de Architecture Decision Records |

## Manuais do usuário

| Documento | Conteúdo |
|-----------|----------|
| [user/manual-clientes.md](user/manual-clientes.md) | Módulo Clientes |
| [user/manual-produtos.md](user/manual-produtos.md) | Módulo Artigos |
| [user/manual-faturamento.md](user/manual-faturamento.md) | Módulo Faturamento |
| [user/manual-aparencia.md](user/manual-aparencia.md) | Tema claro/escuro (botão lateral) |

## Especificações de produto (MVP ISO-ready)

| Documento | Conteúdo |
|-----------|----------|
| [specs/indice.md](specs/indice.md) | Índice: manual técnico, RF/RNF, casos de uso, histórias, casos de teste manual, matriz de rastreabilidade |

---

**Outros idiomas:** [English](../en/README.md) · [Español](../es/README.md) · [Política de documentação](../I18N_DOCUMENTATION.md)

Raiz do repositório: [README.md](../../README.md), [CONTRIBUTING.md](../../CONTRIBUTING.md).
