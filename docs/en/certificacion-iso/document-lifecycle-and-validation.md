# Document lifecycle and validation

This controlled document links **document control**, **Semantic Versioning**, **changelogs**, and **validation / verification** expectations for the ISO-ready documentation set. It does not replace the [Quality Manual](quality-manual.md); it complements it.

## Document identification

- Product and quality Markdown lives in `docs/en/`, `docs/es/`, and `docs/pt-br/` with **localized filenames** per tree; the canonical list is [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md).
- **Git** is the authoritative version history; `main` is the controlled branch for reviewed content.
- ADR files use the **same technical slug** in each locale under `docs/*/adr/`.

## SemVer and changelogs

- Application releases follow [Semantic Versioning](https://semver.org/); the current version is declared in `package.json` at the repository root.
- User-visible changes are recorded under **[Unreleased]** in each locale changelog ([changelog.md](../changelog.md), Spanish and Portuguese counterparts per the map) before a release section is added.

## Validation checklist (before merge)

When you change narrative documentation:

- [ ] The **same logical change** is reflected in **all three** locale trees where that document exists, unless the change is English-only (e.g. typo in a stub that only points to locales).
- [ ] [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md) is updated if any **path** changes.
- [ ] `npm run check:docs-map` passes.
- [ ] If HTTP API behaviour changes: [docs/api/openapi.yaml](../../api/openapi.yaml) and contract tests are updated (see [ADR-0003](../../adr/ADR-0003-api-contract-testing.md)).

## Verification

- **Automated:** CI runs type-check, lint, unit/API tests, coverage thresholds, i18n parity, **Playwright E2E smoke** (`npm run test:e2e`), **PostgreSQL integration tests** (`npm run test:integration` after `prisma migrate deploy` — see [ADR-0004](../../adr/ADR-0004-e2e-playwright-integration-roadmap.md)), and the documentation map check.
- **Human:** Peer review confirms wording matches **evidence** in the repository (no speculative behaviour).

**Related:** [iso-traceability.md](iso-traceability.md) · [records-template.md](records-template.md) · [iso-package-index.md](iso-package-index.md)

**Other languages:** [Español](../../es/certificacion-iso/ciclo-vida-y-validacion-documental.md) · [Português](../../pt-br/certificacion-iso/ciclo-vida-e-validacao-documental.md)
