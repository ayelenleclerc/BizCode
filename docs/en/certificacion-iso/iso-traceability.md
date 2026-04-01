# ISO Traceability Matrix

This matrix maps BizCode's quality artefacts to clauses of the applicable ISO standards. **Controlled Markdown** exists in **three languages** under `docs/en/`, `docs/es/`, and `docs/pt-br/` with **localized filenames** per tree (see [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) and [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)). The **ISO certification package** master register is [iso-package-index.md](iso-package-index.md) (see also [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)).

| Deliverable / Artefact | ISO 9001:2015 | ISO/IEC 12207:2017 | ISO/IEC 27001:2022 | ISO/IEC 25010:2023 | ISO/IEC 29119 |
|---|---|---|---|---|---|
| **iso-package-index.md** (ISO-PKG-001) + [Certificación-ISO/README.md](../../../Certificación-ISO/README.md) | §7.5 Documented information | §6.1.3 Project infrastructure | — | — | — |
| **docs/evidence/sbom-cyclonedx.json** (SBOM-001) + [`npm run sbom:generate`](../../../package.json) | §8.1 Operational planning | §6.3.8 Software construction | A.8.31 | — | — |
| **testing-strategy.md** + Vitest (100% on `src/lib/**`, `server/createApp.ts`, `server.ts`) | §8.7 Control of nonconforming outputs | §6.4.9 Software Qualification Testing | — | Reliability (§4.2.2) | 29119-2 (Test planning), 29119-4 (Test techniques) |
| **accessibility.md** + jsx-a11y (`--max-warnings 0`) + `App.a11y.test.tsx` (jest-axe) | §8.1 Operational planning | — | — | Usability §4.2.4 (Accessibility) | — |
| **i18n-strategy.md** + check-i18n in CI | §8.1 Operational planning | — | — | Portability §4.2.8 (Adaptability) | — |
| **security.md** (STRIDE model, OWASP mapping) | §8.1 Operational planning | §6.3.8 Software Construction | A.8.1–A.8.34 Technological controls | Security §4.2.6 | — |
| **docs/api/openapi.yaml** + `tests/api/contract.test.ts` (Ajv) | §8.3 Design and development | §6.3.2 Software Design | — | Functional suitability §4.2.1 | 29119-2 (test design) |
| **swagger-openapi-ui-plan.md** (+ localized mirrors) — Swagger UI mount checklist, agent OpenAPI policy | §7.5 Documented information, §8.3 Design and development | §6.3.2 Software Design, §6.4.12 Software Documentation | — | Functional suitability §4.2.1 | 29119-2 (test design) |
| **ADR-0003** (API contract) | §8.3.3 Design outputs | §6.3.6 Software Integration | — | Maintainability §4.2.7 | — |
| **ADR-0005** (Vitest coverage — `server.ts`) | §8.7 | §6.4.9 | — | Maintainability §4.2.7 | 29119-2 |
| **ADR-0006** (optional release / Tauri workflows) | §8.5 | §6.4.9 | A.8.25 | — | — |
| **ci-cd.md** + `.github/workflows/ci.yml` | §8.5 Production and service provision | §6.3.6 Software Integration | A.8.25 Secure development lifecycle | — | — |
| **quality-manual.md** + nonconformity process | §4.4 QMS processes, §10.2 Nonconformity | §6.1 Project planning | — | — | — |
| **ADR-0001** (REST/Prisma decision) | §8.3.3 Design outputs | §6.3.2 Software Design | — | Maintainability §4.2.7 | — |
| **ADR-0002** (i18n library decision) | §8.3.3 Design outputs | §6.3.2 Software Design | — | Portability §4.2.8 | — |
| **privacy-data-map.md** | §8.1 | — | A.5.12 Classification, A.5.33 Protection of records | — | — |
| **User manuals** (clientes, articulos, facturacion, apariencia) | §7.5 Documented information | §6.4.12 Software Documentation | — | Usability §4.2.4 (User documentation) | — |
| **theming.md** (UI theme, Tailwind, `index.html`) | §8.3 Design and development | §6.4.12 Software Documentation | — | Usability §4.2.4 (User interface aesthetics) | — |
| **CONTRIBUTING.md** Definition of Done | §8.5.1 Control of production | §6.3.6 Software Integration | A.8.25 | — | 29119-2 §7 (Entry/exit criteria) |
| **records-template.md** (nonconformity, test records) | §10.2.2 Corrective action records | §6.7.1 Records | A.5.33 | — | 29119-3 (Test documentation) |
| **glossary.md** | §7.5 Documented information | §6.1.3 Project infrastructure | — | — | — |
| **`specs/`** bundle (README, technical manual, FR/NFR, use cases, user stories, manual test cases, traceability matrix) | §8.3 Design and development | §6.4.12 Software documentation | — | Functional suitability §4.2.1 | 29119-3 (test documentation) — MVP manual test catalogue |

## Notes

- ISO/IEC 27001 applicability is limited: BizCode is a single-user desktop app with no network exposure. Controls apply to development practices (source code, secrets management), not to operational infrastructure.
- ISO 29119: Parts 2 and 4 are covered by the testing strategy; Part 3 (test documentation) is supported at MVP level by `docs/*/specs/manual-test-cases.md` and session records using [records-template.md](records-template.md).
- ISO/IEC 25010:2023 quality characteristics are addressed at design level; formal measurement and scoring are outside the current scope.

**Other languages:** [Español](../../es/certificacion-iso/trazabilidad-iso.md) · [Português](../../pt-br/certificacion-iso/rastreabilidade-iso.md)
