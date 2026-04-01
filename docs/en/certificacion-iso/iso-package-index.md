# ISO certification package — master register

**Document:** ISO-PKG-001  
**Version:** 1.0  
**Date:** 2026-04-01  

This register is the **single master index** for ISO-oriented controlled documents that live under `docs/en/certificacion-iso/`, `docs/es/certificacion-iso/`, and `docs/pt-br/certificacion-iso/`. It does not duplicate bodies of text; paths below are the **canonical** locations.

**Entry point (repository root):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

| Code | Logical document | Canonical path (en) | Notes |
|------|------------------|----------------------|--------|
| ISO-PKG-001 | This master register | [iso-package-index.md](iso-package-index.md) | Trilingual; same decisions in each locale |
| QM-001 | Quality manual | [quality-manual.md](quality-manual.md) | ISO 9001:2015 scope |
| QMS-TR-001 | ISO traceability matrix (norm → evidence) | [iso-traceability.md](iso-traceability.md) | Maps artefacts to clauses |
| DOC-CTL-001 | Document lifecycle & validation | [document-lifecycle-and-validation.md](document-lifecycle-and-validation.md) | SemVer, changelogs, checklist |
| REC-TPL-001 | Records templates | [records-template.md](records-template.md) | Nonconformity, test session |

## Linked operational quality (not duplicated)

These remain under `docs/*/quality/` and are referenced by the quality manual and traceability matrix:

| Area | English path |
|------|----------------|
| Testing strategy | [../quality/testing-strategy.md](../quality/testing-strategy.md) |
| CI/CD | [../quality/ci-cd.md](../quality/ci-cd.md) |
| Swagger / OpenAPI UI plan | [../quality/swagger-openapi-ui-plan.md](../quality/swagger-openapi-ui-plan.md) |

## Product specifications and API

| Artefact | Path |
|----------|------|
| OpenAPI contract | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Specs index | [../specs/index.md](../specs/index.md) |

## Supply chain evidence (SBOM)

| Code | Artefact | How to produce |
|------|----------|----------------|
| SBOM-001 | CycloneDX JSON (runtime-oriented npm tree; **devDependencies omitted**) | `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json). For a BOM that includes devDependencies: `npm run sbom:generate:full` → `docs/evidence/sbom-cyclonedx-full.json` (large; consider `.gitignore` if not needed in git). Regenerate after dependency changes. Not a substitute for organizational ISMS records. |

See [`docs/evidence/README.md`](../../evidence/README.md).

### Planned code families (incremental)

When new controlled Markdown is approved, add a row here and in the Spanish and Portuguese indices, and register the logical document in [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).

| Prefix | Typical use (illustrative) |
|--------|----------------------------|
| GOV-* | Governance: scope, policies, objectives, process map, interested parties, RACI, audits, management review |
| RSK-* | Risk: methodology, register, treatment, opportunities |
| SEC-* | Information security (when an ISMS scope applies) |

**Other languages:** [Español](../../es/certificacion-iso/indice-paquete-iso.md) · [Português](../../pt-br/certificacion-iso/indice-pacote-iso.md)
