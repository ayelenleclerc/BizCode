# Quality Manual

**Document:** QM-001
**Version:** 1.0
**Date:** 2026-03-31
**Standard:** ISO 9001:2015

---

## 1. Scope

This Quality Manual applies to the development and maintenance of **BizCode**, a commercial management desktop application. It covers the software development lifecycle from requirements through delivery, including design, implementation, testing, and documentation.

This manual does not cover physical manufacturing, external service delivery, or post-sale support processes.

## 2. Quality Policy

BizCode is developed to be **reliable, usable, and auditable**. Our quality commitment is:

- All user-visible code is covered by automated tests with defined thresholds.
- Every build artifact passes a multi-stage CI quality gate before merging.
- Documentation is maintained alongside code in the same repository (English, Spanish, and Brazilian Portuguese under `docs/en/`, `docs/es/`, `docs/pt-br/`).
- Accessibility (WCAG 2.2 AA) and internationalization (3 locales) are treated as first-class requirements, not afterthoughts.
- Defects are tracked, triaged, and resolved with documented root cause when possible.

## 3. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| Developer | Writes code, tests, and documentation; ensures DoD is met before PR |
| Reviewer | Reviews PRs for correctness, standards compliance, and test coverage |
| CI Pipeline | Enforces type-check, lint, coverage thresholds, and i18n parity automatically |
| Product Owner | Defines requirements; accepts features against Definition of Done |

## 4. Document Control

All controlled documents live in the `docs/` directory of the git repository in three language trees. Version history is maintained by git. The `main` branch is the authoritative source.

Documents are updated when the described process changes. Outdated documents must be updated or marked as superseded before a new process is adopted.

**Controlled documents in this system:**

- This Quality Manual (QM-001)
- [iso-package-index.md](iso-package-index.md) (ISO-PKG-001) — master register for the certification package under `docs/*/certificacion-iso/`
- [iso-traceability.md](iso-traceability.md) (per locale)
- [document-lifecycle-and-validation.md](document-lifecycle-and-validation.md) (per locale) — SemVer, changelogs, validation checklist
- [records-template.md](records-template.md) (per locale)
- [../quality/testing-strategy.md](../quality/testing-strategy.md) (per locale)
- [../quality/ci-cd.md](../quality/ci-cd.md) (per locale)
- coding-standards.md (per locale under `docs/*/`)
- accessibility.md (per locale)
- i18n-strategy.md (per locale)
- security.md (per locale)
- All ADRs (per locale)

## 5. Nonconformity and Corrective Action

When a quality standard is not met (e.g., coverage drops below threshold, ESLint reports errors, a critical bug is found in production):

1. **Detect**: CI pipeline or manual review identifies the nonconformity.
2. **Contain**: Block the merge or revert the deployment.
3. **Analyse**: Identify root cause (see [records-template.md](records-template.md)).
4. **Correct**: Implement a fix and verify it resolves the root cause.
5. **Prevent**: Add a test case or linting rule to prevent recurrence.
6. **Record**: Document the nonconformity and resolution.

## 6. Continual Improvement

Quality improvement opportunities are tracked as GitHub Issues with the label `quality`. They are reviewed at the start of each development sprint.

The CI coverage report (`coverage/index.html`) is archived as a build artifact for 14 days and reviewed at each release to identify declining coverage trends.
