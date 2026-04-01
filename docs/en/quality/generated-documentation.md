# Generated documentation

BizCode commits **machine-generated** reference material alongside the source of truth (TypeScript, `docs/api/openapi.yaml`, `package-lock.json`). Regenerate with **`npm run docs:generate`** before pushing when your change affects code, the API contract, or production dependencies, and **commit the outputs** in the same PR.

## Outputs (not edited by hand)

| Artifact | Location | Generator |
|----------|----------|-----------|
| TypeScript API (HTML) | [`docs/generated/typedoc/`](../../generated/typedoc/index.html) | [TypeDoc](https://typedoc.org/) (`typedoc.json`) |
| OpenAPI → Markdown | [`docs/api/openapi-reference.generated.md`](../../api/openapi-reference.generated.md) | [`@scalar/openapi-to-markdown`](https://www.npmjs.com/package/@scalar/openapi-to-markdown) via `scripts/generate-openapi-markdown.ts` |
| JSON Schema → Markdown | [`docs/generated/schema-md/`](../../generated/schema-md/README.md) | Schemas extracted from OpenAPI (`scripts/extract-openapi-schemas.ts`) + [`@adobe/jsonschema2md`](https://www.npmjs.com/package/@adobe/jsonschema2md) |
| SBOM (CycloneDX JSON) | [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json) | `@cyclonedx/cyclonedx-npm` (`npm run sbom:generate`) |

The canonical API contract remains **`docs/api/openapi.yaml`** plus contract tests (`tests/api/`). Swagger UI at `/api-docs` reflects the same file.

## CI

The quality gate runs `npm run docs:generate` and fails if `git diff` shows uncommitted changes under `docs/generated/`, `docs/api/openapi-reference.generated.md`, or `docs/evidence/sbom-cyclonedx.json`. See [CI/CD pipeline](ci-cd.md).

## Versioning

Generated files are versioned **with the repository** (same commits/PRs as code). GitHub Releases from [semantic-release](../../adr/ADR-0006-release-and-tauri-ci-workflows.md) point to commits that already include these artifacts; no separate documentation release step is required for this material.
