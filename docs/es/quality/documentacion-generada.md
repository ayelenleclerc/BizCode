# Documentación generada

El proyecto versiona **material de referencia generado automáticamente** junto a la fuente de verdad (TypeScript, `docs/api/openapi.yaml`, `package-lock.json`). Regenerar con **`npm run docs:generate`** antes de publicar cambios que afecten código, contrato de API o dependencias de producción, e **incluir los artefactos** en el mismo PR.

## Salidas (no editar a mano)

| Artefacto | Ubicación | Generador |
|-----------|-----------|-----------|
| API TypeScript (HTML) | [`docs/generated/typedoc/`](../../generated/typedoc/index.html) | [TypeDoc](https://typedoc.org/) (`typedoc.json`) |
| OpenAPI → Markdown | [`docs/api/openapi-reference.generated.md`](../../api/openapi-reference.generated.md) | [`@scalar/openapi-to-markdown`](https://www.npmjs.com/package/@scalar/openapi-to-markdown) vía `scripts/generate-openapi-markdown.ts` |
| JSON Schema → Markdown | [`docs/generated/schema-md/`](../../generated/schema-md/README.md) | Esquemas extraídos del OpenAPI (`scripts/extract-openapi-schemas.ts`) + [`@adobe/jsonschema2md`](https://www.npmjs.com/package/@adobe/jsonschema2md) |
| SBOM (CycloneDX JSON) | [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json) | `@cyclonedx/cyclonedx-npm` (`npm run sbom:generate`) |

El contrato canónico de la API sigue siendo **`docs/api/openapi.yaml`** más las pruebas de contrato (`tests/api/`). Swagger UI en `/api-docs` usa el mismo archivo.

## CI

La verificación de calidad ejecuta `npm run docs:generate` y falla si `git diff` muestra cambios sin commitear en `docs/generated/`, `docs/api/openapi-reference.generated.md` o `docs/evidence/sbom-cyclonedx.json`. Ver [Pipeline CI/CD](ciclo-ci-cd.md).

## Versionado

Los archivos generados se versionan **con el repositorio** (mismos commits/PR que el código). Los releases de GitHub vía [semantic-release](../../adr/ADR-0006-release-and-tauri-ci-workflows.md) apuntan a commits que ya incluyen estos artefactos; no hace falta un paso de release documental aparte para este material.
