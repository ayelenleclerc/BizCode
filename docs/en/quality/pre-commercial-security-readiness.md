# Pre-commercial security readiness (#194)

**Document role:** Go/no-go evaluation of security controls **before real customer data / real charges**.  
**Related issue:** [#194](https://github.com/ayelenleclerc/BizCode/issues/194) · parent block [#452](https://github.com/ayelenleclerc/BizCode/issues/452)  
**Evidence date:** 2026-11-11 against `develop` (ZAP triage branch `fix/194-zap-baseline-triage`; prior readiness 2026-11-08).

This document does **not** hire a vendor, invent findings, or close #194. An empty [pentest report register](../../evidence/pentest-report-register.md) remains a blocking residual for full AC.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Inventory CI controls vs issue AC | Contracting Option A/B/C vendors |
| Explicit gaps (Snyk token, empty register; ZAP triage status) | Simulated external report / fake findings |
| Go/no-go for **real data** use | Closing #194 or claiming commercial launch ready |
| Cross-links to penetration-testing + pilot matrix | FCEM MVP mock in `develop` (live residual); `/status` in repo; staging DR + external monitor pending |

## Acceptance criteria vs repo evidence

| #194 AC (issue) | Repo evidence | Status |
|-----------------|---------------|--------|
| Automated scan (ZAP + Snyk) in CI/CD before prod deploy | [`.github/workflows/zap.yml`](../../../.github/workflows/zap.yml) (no `-I`; `ubuntu-24.04`; rules in [`.zap/rules.tsv`](../../../.zap/rules.tsv)); [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml); `pnpm audit --audit-level=high` in Quality Gate | **Partial** — ZAP baseline is merge-blocking for unignored WARN/FAIL; Snyk **skips** when `SNYK_TOKEN` unset |
| Zero Critical/High unmitigated before launch | Audit + Snyk (when token) + dependency triage docs (#219) | **Conditional** — CI HIGH+ gate exists for audit; Snyk not guaranteed without secret; ZAP blocks unignored alerts |
| External pentest report + remediation plan | [pentest-report-register.md](../../evidence/pentest-report-register.md) | **Not evidenced** — register empty |
| Critical findings from external report mitigated before commercial launch | N/A until report exists | **Blocked** on vendor/budget decision (#452) |

## Pre-engagement checklist (engineering) vs evidence

| Pre-task from #194 | Evidence / note |
|--------------------|-----------------|
| `npm`/`pnpm audit` + update vulnerable deps | Quality Gate audit HIGH+; [dependency-scanning-and-triage.md](dependency-scanning-and-triage.md) |
| Snyk scan | Workflow present; enforcement depends on `SNYK_TOKEN` repository secret |
| Review endpoints for excess data | Ongoing product work — **not** closed by this readiness doc |
| Confirm no unsanitized raw SQL | Policy in [penetration-testing.md](penetration-testing.md); verify with code review before vendor |
| Logs free of tokens/passwords/PII | Pre-launch checklist in [security.md](../security.md) — ops confirmation required |

## Go / no-go — real customer data

### Go (pilot / synthetic only)

All of the following:

1. Pilot technical gates (#446–#451, #450) treated separately from commercial security.
2. No real customer PII / fiscal production data / live Mercado Pago charges in the environment under test.
3. Operators acknowledge residual gaps in the table below.

### No-go (real data / commercial charges)

**No-go** if any of:

1. External pentest register still empty **and** product owner has not accepted residual risk in writing for a named limited pilot.
2. `SNYK_TOKEN` unset in the repository that deploys the commercial host (Snyk gate skipped).
3. ~~ZAP still using `-I` without triage~~ — **mitigated 2026-11-11** (`-I` removed; `10049` IGNORE documented for ephemeral API 404s). Staging UI via `ZAP_TARGET_URL` should re-check cache rules.
4. Open Critical/High dependency findings without ADR/exception.

**Verdict 2026-11-11:** **NO-GO for real data** — ZAP CI gate hardened; external report AC still unmet; Snyk conditional on `SNYK_TOKEN`.

## Explicit gaps (do not invent)

| Gap | Location | Impact |
|-----|----------|--------|
| Empty external report register | `docs/evidence/pentest-report-register.md` | Blocks full #194 AC |
| Optional Snyk | `.github/workflows/snyk.yml` | Gate skipped without `SNYK_TOKEN` |
| Vendor hire | Budget / #452 | Not a Cursor coding task |
| ZAP `-I` (historical) | Removed from `.github/workflows/zap.yml` | Mitigated — see [`.zap/rules.tsv`](../../../.zap/rules.tsv) |

## Related

- [Penetration testing](penetration-testing.md)
- [Distributor pilot coverage matrix](distributor-pilot-coverage-matrix.md)
- [SLA](sla.md) / [Disaster recovery](disaster-recovery.md) (#197 — after this gate)

## Other languages

- Español: [readiness-seguridad-precomercial.md](../../es/quality/readiness-seguridad-precomercial.md)
- Português: [prontidao-seguranca-precomercial.md](../../pt-br/quality/prontidao-seguranca-precomercial.md)

## Revision history

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 | 2026-11-08 | BizCode | Initial readiness gate evaluation for #194 |
| 0.2 | 2026-11-11 | BizCode | ZAP triage: remove `-I`, pin `10049` IGNORE, ubuntu-24.04; NO-GO remains (empty register) |
