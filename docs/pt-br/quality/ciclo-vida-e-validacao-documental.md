# Ciclo de vida documental e validação

Este documento controlado liga **controle documental**, **SemVer**, **históricos de alterações** e expectativas de **validação / verificação** para o conjunto de documentação ISO-ready. Não substitui o [manual da qualidade](manual-qualidade.md); complementa-o.

## Identificação documental

- A documentação de produto e qualidade fica em `docs/en/`, `docs/es/` e `docs/pt-br/` com **nomes de arquivo localizados**; a lista canônica é [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).
- O **Git** é o histórico de versões autoritativo; a branch `main` é a referência revisada.
- Os ADRs usam o **mesmo slug técnico** em cada locale em `docs/*/adr/`.

## SemVer e changelogs

- Os lançamentos seguem [Semantic Versioning](https://semver.org/); a versão atual está em `package.json` na raiz do repositório.
- Alterações visíveis ao utilizador são registadas em **[Unreleased]** em cada changelog por idioma (ver [historico-de-alteracoes.md](../historico-de-alteracoes.md) e equivalentes no mapa) antes de acrescentar uma secção de versão.

## Lista de validação (antes do merge)

Ao alterar documentação narrativa:

- [ ] A **mesma alteração lógica** está nos **três** locais onde o documento existir, salvo correções pontuais só em stubs.
- [ ] [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md) é atualizado se algum **caminho** mudar.
- [ ] `npm run check:docs-map` conclui com sucesso.
- [ ] Se o comportamento da API HTTP mudar: [docs/api/openapi.yaml](../../api/openapi.yaml) e testes de contrato (ver [ADR-0003](../../adr/ADR-0003-api-contract-testing.md)).

## Verificação

- **Automatizada:** CI executa type-check, lint, testes unitários/API, cobertura, paridade i18n, **smoke E2E Playwright** (`npm run test:e2e` — ver [ADR-0004](../../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) e verificação do mapa documental.
- **Humana:** revisão por pares; o texto deve refletir **evidência** no repositório (sem especular).

**Relacionado:** [rastreabilidade-iso.md](rastreabilidade-iso.md) · [modelos-registros.md](modelos-registros.md)

**Outros idiomas:** [English](../../en/quality/document-lifecycle-and-validation.md) · [Español](../../es/quality/ciclo-vida-y-validacion-documental.md)
