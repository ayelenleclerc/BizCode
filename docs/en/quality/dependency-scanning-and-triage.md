# Dependency scanning and triage (#219)

## Purpose

How operators respond to Dependabot, `pnpm audit`, Snyk, and Trivy image alerts for BizCode.

Normative decision: [ADR-0017](../adr/ADR-0017-dependency-scanning.md).

## Tools in CI

| Tool | Where | Gate |
|------|--------|------|
| Dependabot | `.github/dependabot.yml` | Opens weekly PRs (npm workspace + GitHub Actions); review and merge |
| `pnpm audit --audit-level=high` | Quality Gate (`ci.yml`), weekly `dependency-maintenance.yml` | **Blocks** on HIGH+ (see ADR for accepted `ignoreCves`) |
| Snyk `test` / `monitor` | `.github/workflows/snyk.yml` | **Blocks** HIGH+ with fix (`--fail-on=upgradable`); needs `SNYK_TOKEN` |
| Trivy image | `deploy.yml` after `docker build` | **Blocks** CRITICAL before GHCR push |
| Trivy IaC | `infrastructure-validation.yml` | Terraform config (existing) |
| CycloneDX SBOM | `docs/evidence/sbom-cyclonedx.json` | Regenerated via `pnpm run sbom:generate` (`pnpm dlx @cyclonedx/cdxgen`) / `docs:generate` |

## Setup: `SNYK_TOKEN`

1. Create a Snyk account and link GitHub repo `ayelenleclerc/BizCode`.
2. Create a service account / API token with project access.
3. Add repository secret **`SNYK_TOKEN`** (Settings → Secrets and variables → Actions).
4. Without this secret, the Snyk workflow fails with an actionable error (by design).

## Setup: Snyk README badge

The README badge reports Snyk status for this GitHub repo. After linking the project in Snyk, the badge updates automatically. If it shows “unknown”, confirm the integration in the Snyk UI.

## Triage playbook

1. **Identify source:** Dependabot PR, CI audit log, Snyk UI/CLI, or Trivy image step.
2. **Severity:** CRITICAL/HIGH with a published fix → remediate before merge. Moderate → schedule.
3. **Prefer:** bump direct dependency or add a targeted `pnpm.overrides` entry; re-run `pnpm install` and `pnpm audit --audit-level=high`.
4. **Containers:** bump `FROM` tags in `Dockerfile` / `Dockerfile.frontend` when Trivy CRITICAL is in the base image; rebuild and re-scan.
5. **Exceptions:** only via `pnpm.auditConfig.ignoreCves` (or ADR amendment) with reason and review date — never silent `continue-on-error` on the Quality Gate audit step.
6. **Verify:** local audit exit 0; push and confirm Snyk + Trivy jobs green.

## Out of scope

Socket.dev, Renovate, mobile certificate pinning (#220).
