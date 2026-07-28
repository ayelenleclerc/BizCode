# ADR-0017: Dependency and container vulnerability scanning

**Status:** Accepted  
**Date:** 2026-07-28  
**ISO reference:** ISO/IEC 27001:2022 A.8.8 (management of technical vulnerabilities); A.5.23 (information security for use of cloud services)

---

## Context

BizCode already runs informational `pnpm audit`, CodeQL, Gitleaks, CycloneDX SBOM generation, and Trivy **IaC** scans on Terraform. Issue #219 requires automated dependency update PRs (Dependabot), blocking CI on high-severity dependency findings (Snyk + audit), Docker **image** scanning (Trivy) before registry push, a README badge, and a documented triage process. The monorepo uses **pnpm** (`pnpm-lock.yaml`), not npm’s lockfile.

## Decision

1. **Dependabot:** `.github/dependabot.yml` with `package-ecosystem: npm` at `/` (workspace root / pnpm) and `github-actions` at `/`, schedule **weekly**, grouped **patch** updates to reduce PR noise. GitHub-native security updates remain enabled separately in repo settings.
2. **Audit gate:** CI Quality Gate runs `pnpm audit --audit-level=high` **without** `continue-on-error` (blocks merge on HIGH+). Scheduled `dependency-maintenance` keeps the same command for visibility.
3. **Snyk:** GitHub Actions job uses `SNYK_TOKEN` repository secret. `snyk test --severity-threshold=high --fail-on=upgradable` on pull requests and pushes; `snyk monitor` on push to `develop`/`main`. Missing `SNYK_TOKEN` fails the job with an actionable message (operators must configure the secret).
4. **Trivy images:** After `docker build` of API and frontend in Deploy Containers, scan local tags with Trivy; **fail on CRITICAL** before GHCR publish. Existing Terraform IaC Trivy remains.
5. **Documentation:** Trilingual triage guide under `docs/*/quality/` (locale map). README Snyk badge for `ayelenleclerc/BizCode` (ops must link the repo in Snyk once for live status). SBOM generation uses `pnpm dlx @cyclonedx/cdxgen` (pnpm 10–compatible) instead of `@cyclonedx/cyclonedx-npm` (incompatible `pnpm ls` flags / shell-injection advisory on older majors).
6. **Out of scope v1:** Socket.dev, Renovate, `dependency-review-action`, mobile app hardening (#220).

## Consequences

- **Positive:** Automated dependency PRs; multi-layer vuln detection (audit + Snyk + image Trivy); ISO evidence for technical vulnerability management.
- **Negative:** Requires `SNYK_TOKEN`; first runs may fail until HIGH/CRITICAL with fixes are remediated or base images bumped; Dependabot PRs need review bandwidth.
- **Remediation:** Prefer patch/minor bumps in the same change that introduced the gate; temporary exceptions must be recorded in this ADR with expiry (none at acceptance).
- **Accepted audit ignore (2026-07-28):** `pnpm.auditConfig.ignoreCves` includes `CVE-2026-14257` (`brace-expansion` / GHSA-mh99-v99m-4gvg). The published vulnerable range `<=5.0.7` also matches already-pinned `1.1.16` / `2.1.3` lines; the tree forces `brace-expansion@5` to `5.0.8`. Revisit when the advisory publishes per-major ranges or when minimatch drops legacy brace-expansion majors. Expiry review: **2026-10-28**.

## References

- Issue #219
- [Dependency scanning triage](../quality/dependency-scanning-and-triage.md)
- [CI/CD](../quality/ci-cd.md)
