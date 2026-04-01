# Documentação gerada

O repositório versiona **material de referência gerado automaticamente** junto à fonte da verdade (TypeScript, `docs/api/openapi.yaml`, `package-lock.json`). Regenerar com **`npm run docs:generate`** antes de enviar alterações que afetem código, contrato da API ou dependências de produção, e **incluir os artefatos** no mesmo PR.

## Saídas (não editar manualmente)

| Artefato | Localização | Gerador |
|----------|-------------|---------|
| API TypeScript (HTML) | [`docs/generated/typedoc/`](../../generated/typedoc/index.html) | [TypeDoc](https://typedoc.org/) (`typedoc.json`) |
| OpenAPI → Markdown | [`docs/api/openapi-reference.generated.md`](../../api/openapi-reference.generated.md) | [`@scalar/openapi-to-markdown`](https://www.npmjs.com/package/@scalar/openapi-to-markdown) via `scripts/generate-openapi-markdown.ts` |
| JSON Schema → Markdown | [`docs/generated/schema-md/`](../../generated/schema-md/README.md) | Esquemas extraídos do OpenAPI (`scripts/extract-openapi-schemas.ts`) + [`@adobe/jsonschema2md`](https://www.npmjs.com/package/@adobe/jsonschema2md) |
| SBOM (CycloneDX JSON) | [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json) | `@cyclonedx/cyclonedx-npm` (`npm run sbom:generate`) |

O contrato canônico da API continua sendo **`docs/api/openapi.yaml`** e os testes de contrato (`tests/api/`). O Swagger UI em `/api-docs` usa o mesmo arquivo.

## CI

O *quality gate* executa `npm run docs:generate` e falha se `git diff` mostrar alterações não commitadas em `docs/generated/`, `docs/api/openapi-reference.generated.md` ou `docs/evidence/sbom-cyclonedx.json`. Ver [Pipeline CI/CD](ciclo-ci-cd.md).

## Versionamento

Os arquivos gerados são versionados **com o repositório** (mesmos commits/PR que o código). Releases no GitHub via [semantic-release](../../adr/ADR-0006-release-and-tauri-ci-workflows.md) apontam para commits que já incluem esses artefatos; não é necessário um passo de release documental separado para este material.
