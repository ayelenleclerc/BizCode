# Wiki vs controlled documentation policy

## Purpose

Define what can live in GitHub Wiki and what must remain in repository-controlled documentation for auditability and release governance.

## Decision

- GitHub Wiki is allowed for operational and fast-changing guidance.
- Repository documentation is mandatory for controlled, auditable, and release-gated artifacts.

## Repository-controlled content (mandatory in `docs/` or `Certificación-ISO/`)

- Quality, process, and compliance documents.
- ISO evidence, procedures, and traceability records.
- Product behavior, API contract, and architecture decisions.
- Any document required by CI checks or release criteria.

## Wiki-allowed content (supporting only)

- Operational runbooks and troubleshooting notes.
- Internal FAQs and quick-start instructions.
- Temporary investigation notes before formalization in controlled docs.

## Enforcement

- CI workflow `Docs governance guard` checks PRs touching controlled docs.
- If localized controlled docs are updated in one locale, EN/ES/PT-BR coverage is required in the same PR.
- OpenAPI remains single-source at `docs/api/openapi.yaml` (non-translated contract).
