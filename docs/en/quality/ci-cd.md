# CI/CD Pipeline

## Overview

BizCode uses GitHub Actions for continuous integration. The pipeline is defined in `.github/workflows/ci.yml`.

## Pipeline Stages

```
push / pull_request
      │
      ▼
┌──────────────────────────────────────────────────────────────┐
│  Job: quality (ubuntu-latest)                              │
│                                                              │
│  1. Checkout                                                 │
│  2. Setup Node.js 20 (cache: npm)                           │
│  3. npm ci --legacy-peer-deps                              │
│  4. npx prisma generate                                     │
│  5. npm run type-check           ← blocks                   │
│  6. npm run lint                 ← blocks                   │
│  7. npm run test:coverage        ← blocks (Vitest + coverage + API contract + a11y) │
│  8. npm run check:i18n           ← blocks                   │
│  9. npx playwright install --with-deps chromium             │
│ 10. npm run test:e2e             ← blocks (Playwright smoke; see ADR-0004) │
│ 11. npm run check:docs-map       ← blocks                   │
│ 12. Upload coverage artifact (always)                       │
└──────────────────────────────────────────────────────────────┘
```

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | targeting `main` |

## Blocking Conditions

| Step | Blocking condition |
|---|---|
| type-check | Any TypeScript compilation error |
| lint | Any ESLint error or **warning** (`npm run lint` uses `--max-warnings 0`) |
| test:coverage | Any test failure OR any coverage threshold not met |
| check:i18n | Any locale namespace has missing or extra keys vs. `es` source |
| test:e2e | Any Playwright failure (includes `vite build` + preview via `playwright.config.ts`) |
| check:docs-map | Any path in `DOCUMENT_LOCALE_MAP.md` missing on disk |

## Services

The job starts a **PostgreSQL 16** service container (`DATABASE_URL` is set). Automated tests in the current suite **mock Prisma** in API contract tests; the service is available for **future** integration tests ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md) Phase B).

## Artifacts

| Artifact | Retention | Contents |
|---|---|---|
| `coverage-report` | 14 days | `coverage/` directory (HTML, LCOV, text summary) |

## What Is NOT in CI

**Tauri desktop build** is excluded from CI (native WebKit/WebView2, display server, Rust toolchain). See workflow comments in `.github/workflows/ci.yml`.

## Future Improvements

- [ ] `npm audit --audit-level=high` (non-blocking warning initially)
- [ ] PostgreSQL-backed integration tests (Phase B, ADR-0004)
- [ ] Tauri build on self-hosted runner for release artifacts
- [ ] semantic-release for automated versioning on merge to `main`
