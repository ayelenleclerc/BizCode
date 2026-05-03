# ADR-0006: Optional CI — semantic-release and Tauri self-hosted build

**Status:** Accepted  
**Date:** 2026-03-31  
**ISO reference:** ISO/IEC 12207:2017 §6.4.9 (deployment / release)

---

## Context

The default pipeline ([ci-cd.md](../quality/ci-cd.md)) blocks on quality gates; it does **not** publish releases or build Tauri desktop artifacts. The backlog listed **optional** improvements: non-blocking `npm audit`, **semantic-release**, and **Tauri** on a self-hosted runner.

## Decision

1. **`npm audit`:** GitHub Actions runs `npm audit --audit-level=high` after `npm ci` with **`continue-on-error: true`** so vulnerabilities are visible without failing the gate until the team resolves them.
2. **semantic-release:** `release.config.cjs` at the repo root; workflow `.github/workflows/release.yml` runs **only** on **`workflow_dispatch`**, creates GitHub Releases from [Conventional Commits](https://www.conventionalcommits.org/) on `main` using the default `GITHUB_TOKEN`. No npm publish (package is `private`).
3. **Tauri self-hosted:** workflow `.github/workflows/tauri-selfhosted.yml` runs **only** on **`workflow_dispatch`** on **`runs-on: self-hosted`**. The runner must provide Rust, Node, and platform-native WebView dependencies (see [ci-cd.md](../quality/ci-cd.md)) — the workflow does **not** run on `ubuntu-latest` in the default job.

## Consequences

- **Positive:** optional automation is documented and versioned; no change to the default PR quality gate.
- **Negative:** semantic-release and Tauri workflows require manual trigger and correct runner/secrets awareness; failed self-hosted runs are an operator concern.

## Release gate checklist (solo operador / lanzamiento escritorio)

1. **`main`** must pass the standard **Quality Gate** (`ci.yml`): API correctness, regenerated docs parity, ESLint zero warnings, Vitest coverage thresholds over the scopes in `vitest.config.ts`, Playwright smoke (runs `vite build` + preview), and PostgreSQL integration tests.
2. Before publishing **desktop installers** (Windows MSI/AppX, macOS DMG/App, Linux bundles), run **Actions → Tauri self-hosted build** (`tauri-selfhosted.yml`) on a self-hosted runner with Rust + native WebView toolchains. **This is not exercised on every PR** and does not substitute the SaaS-facing gate documented in [ci-cd.md](../quality/ci-cd.md#what-is-not-in-ci).
3. If adopting tagged releases via semantic-release, run **`release.yml`** (`workflow_dispatch` on `main`) after validating step 2 when desktop artifacts are required.

## References

- [quality/ci-cd.md](../quality/ci-cd.md)
- `release.config.cjs`, `.github/workflows/release.yml`, `.github/workflows/tauri-selfhosted.yml`
