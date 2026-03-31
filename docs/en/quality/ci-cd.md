# CI/CD Pipeline

## Overview

BizCode uses GitHub Actions for continuous integration. The pipeline is defined in `.github/workflows/ci.yml`.

## Pipeline Stages

```
push / pull_request
      │
      ▼
┌─────────────────────────────────────────────┐
│  Job: quality (ubuntu-latest)               │
│                                             │
│  1. Checkout                                │
│  2. Setup Node.js 20 (cache: npm)           │
│  3. npm ci --legacy-peer-deps               │
│  4. npx prisma generate                     │
│  5. npm run type-check        ← blocks      │
│  6. npm run lint              ← blocks      │
│  7. npm run test:coverage     ← blocks (Vitest + coverage + OpenAPI contract + axe smoke) │
│  8. npm run check:i18n        ← blocks      │
│  9. Upload coverage artifact  (always)      │
└─────────────────────────────────────────────┘
```

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | targeting `main` |

## Blocking Conditions

A step blocks the pipeline (exit code ≠ 0) when:

| Step | Blocking condition |
|---|---|
| type-check | Any TypeScript compilation error |
| lint | Any ESLint error or **warning** (`npm run lint` uses `--max-warnings 0`) |
| test:coverage | Any test failure OR any coverage threshold not met |
| check:i18n | Any locale namespace has missing or extra keys vs. `es` source |

## Services

The CI job starts a PostgreSQL 16 service container for `api.test.ts` integration tests. Connection string: `postgresql://bizcode:bizcode@localhost:5432/bizcode_test`.

## Artifacts

| Artifact | Retention | Contents |
|---|---|---|
| `coverage-report` | 14 days | `coverage/` directory (HTML, LCOV, text summary) |

## What Is NOT in CI

**Tauri desktop build** is excluded from CI for the following reasons:

1. Requires platform-native WebKit: `libwebkit2gtk-4.0-dev` on Linux, WebView2 on Windows, WebKit on macOS.
2. Requires a display server (Xvfb or equivalent) for rendering.
3. Requires the Rust toolchain and Tauri CLI, significantly increasing build time.

**Workaround for desktop builds:**
- Developers build locally with `npm run tauri build` or `npm run tauri dev`.
- A future self-hosted runner workflow can be added for release builds.

## Future Improvements

- [ ] Add `npm audit --audit-level=high` step (non-blocking warning initially)
- [ ] Add E2E tests with Playwright (requires Xvfb in CI)
- [ ] Add Tauri build step on self-hosted Windows runner for release artifacts
- [ ] Add semantic-release for automated versioning on merge to `main`
