# Penetration testing (#194)

## Purpose

Describes how BizCode prepares for and records **security penetration testing** before commercial launch: automated DAST (OWASP ZAP) in CI, dependency gates already provided by #219, and the **external** engagement required for a formal report.

**Evidence status:** Automated ZAP baseline workflow is implemented in product CI. An external pentest **report is not evidenced** until ops archives a real vendor deliverable. Not a certification claim.

## What is in CI vs what is not

| Control | Location | Blocks merge? |
|---------|----------|---------------|
| `pnpm audit --audit-level=high` | Quality Gate ([`ci.yml`](../../../.github/workflows/ci.yml)) | Yes (HIGH+) |
| Snyk | [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml) | Yes when `SNYK_TOKEN` set (HIGH+ with fix) |
| OWASP ZAP baseline | [`.github/workflows/zap.yml`](../../../.github/workflows/zap.yml) | No until rules triage removes `-I` (WARN noise) |
| External pentest report | Ops + [evidence register](../../evidence/pentest-report-register.md) | Required for full #194 AC |

**ZAP CI reports are not a substitute for an external pentest report.**

## ZAP baseline workflow

1. On pull request / push to `develop` or `main`, and on `workflow_dispatch`.
2. Default target: ephemeral API (`pnpm run server` + Postgres service) at `http://127.0.0.1:3001`.
3. Optional GitHub Actions **repository variable** `ZAP_TARGET_URL` (must be `http://` or `https://`, staging/non-prod only). Fail-closed if the value is malformed. **Do not** set production URLs with live customer data or secrets.
4. Scanner runs in Docker with `--network host` so the container can reach the runner API.
5. Rules file: [`.zap/rules.tsv`](../../../.zap/rules.tsv). After triage, IGNORE known false positives; then remove `-I` from the workflow to fail on remaining WARN/FAIL.
6. Artifact: `zap-baseline-report` (HTML/JSON/Markdown under `zap-out/`). Retention 14 days. Do not commit reports that may contain environment details into git without review.

## Pre-engagement engineering checklist

See [security.md](../security.md) (pre-launch checklist). Summary:

- Dependency HIGH+ remediated or documented exception (ADR/triage).
- Raw SQL call sites use parameterized Prisma tagged templates.
- Helmet security headers on the API.
- Confirm no tokens/passwords in application logs before exposing staging to a vendor.

## External engagement (ops)

Options from [#194](https://github.com/ayelenleclerc/BizCode/issues/194): specialized firm, certified freelancer, or private bug bounty. Minimum automated MVP (ZAP + Snyk) does **not** close the issue AC for “informe del pentest externo”.

### Process

1. Choose vendor; define scope (auth/IDOR, injection, API enumeration, secrets, AFIP/MP token handling, XSS/CSRF/CSP).
2. Provide **staging** only; rotate credentials after the engagement.
3. Receive report (PDF/HTML); store outside public git if it contains exploit detail, and fill [pentest-report-register.md](../../evidence/pentest-report-register.md) with metadata + link/path.
4. Open GitHub issues for each finding; remediate **Critical/High** before commercial launch.
5. Keep [#194](https://github.com/ayelenleclerc/BizCode/issues/194) **open** until the register has a real report entry and critical remediations are tracked or done.

## ISO stubs

- [SEC-010](../certificacion-iso/sec/sec-010-vulnerability-patch-management-procedure.md) — vulnerability / patch / scanning process.
- [SEC-013](../certificacion-iso/sec/sec-013-supplier-security-assessment-register.md) — supplier (pentest vendor) assessment register link.

## Related

- [security.md](../security.md)
- [dependency-scanning-and-triage.md](dependency-scanning-and-triage.md)
- [ci-cd.md](ci-cd.md)
- [ADR-0017](../adr/ADR-0017-dependency-scanning.md)
