# Non-functional requirements (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.1 |
| Revision | 1 |
| Date | 2026-03-31 |
| Product reference | BizCode 0.1.0 MVP |

| ID | Requirement | Evidence |
|----|---------------|----------|
| NFR-001 | **Accessibility:** Meet WCAG 2.2 **AA** as project policy; automated checks via ESLint `jsx-a11y` (zero warnings in CI) and jest-axe smoke on the app shell. | [accessibility.md](../accessibility.md), `src/App.a11y.test.tsx`, ESLint config |
| NFR-002 | **Internationalization:** Three locales `es`, `en`, `pt-BR` with key parity; CI fails on drift. | [i18n-strategy.md](../i18n-strategy.md), `scripts/check-i18n.ts` |
| NFR-003 | **Security (desktop scope):** API intended for loopback; threat model documented. | [security.md](../security.md) |
| NFR-004 | **Privacy:** Personal data inventory documented. | [privacy-data-map.md](../privacy-data-map.md) |
| NFR-005 | **Testing:** Unit coverage thresholds enforced for agreed scope (`src/lib/**/*.ts`, `server/createApp.ts`); API contract tests vs OpenAPI. | [testing-strategy.md](../quality/testing-strategy.md), `vitest.config.ts`, `tests/api/contract.test.ts` |
| NFR-006 | **Code quality:** TypeScript strict; no `any` without documented exception; project rules in `.cursor/rules/`. | [coding-standards.md](../coding-standards.md), [ADR-0003](../adr/ADR-0003-api-contract-testing.md) |

**Other languages:** [Español](../../es/specs/non-functional-requirements.md) · [Português](../../pt-br/specs/non-functional-requirements.md)
