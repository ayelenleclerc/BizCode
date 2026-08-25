# Risk treatment plan

| Document code | RSK-004 |
| Version | 0.2 |
| Date | 2026-08-25 |
| Author | BizCode |
| Requirement level | Mandatory |
| Normative applicability | ISO 9001:2015; ISO/IEC 27001:2022; ISO/IEC 20000-1:2018; ISO/IEC 42001:2023 |
| Evidence status | Partial — initial action plan for #196 |

## Out-of-scope statement

ISO-ready treatment plan. Does not claim certification or guarantee dates for external vendors.

## Purpose

Define actions to reduce risks in [RSK-002](rsk-002-risk-register.md), with owners, target windows, and linked issues.

## Treatment options

Mitigate · Accept · Transfer · Avoid (stated per row).

## Action plan

| Risk ID | Treatment | Action | Owner | Target | Link |
|---------|-----------|--------|-------|--------|------|
| R-01 | Mitigate | Keep IDOR/tenant isolation in external pentest scope; remediate Critical/High findings | Engineering | After #194 report | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-02 | Mitigate | Maintain `check:logs` / redaction; operators review production sinks before launch | Engineering + Ops | Before commercial launch | Log sanitization policy |
| R-03 | Mitigate | Keep Quality Gate `pnpm audit` High+ blocking; triage per #219 | Engineering | Continuous | Dependency scanning |
| R-04 | Mitigate | Commission external pentest; archive report in evidence register | Product owner | Before commercial launch | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-05 | Mitigate | Execute restore drill on staging; record RTO | Platform ops | With #197 | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-06 | Mitigate | Follow deployment-environments guards; never point staging tools at prod DB | Platform ops | Continuous | #152 docs |
| R-07 | Mitigate | Rotate bootstrap/seed passwords per environment; no shared prod secrets | Product owner | Continuous | security.md |
| R-08 | Mitigate | Operate privacy request process per #195 docs | Product owner | Continuous | #195 |
| R-09 | Mitigate | Pin Actions; review SBOM on release; block High+ deps | Engineering | Continuous | CI / SBOM |
| R-10 | Mitigate | Enforce TLS + WAF on hosted edges per Cloudflare/deploy docs | Platform ops | Before SaaS GA | #217 |
| R-11 | Mitigate | Publish SLA + DR runbooks; complete drill | Product owner | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) | #197 |
| R-12 | Mitigate | Deliver operator security awareness briefing; keep attendance record (org) | Product owner | Within 90 days of #196 merge | HR / ops |

## Gap themes already closed by this issue (#196)

- Documented Annex A gap analysis (canonical quality docs).
- Initial SoA (SEC-002).
- ISMS policy section (SEC-001 / security.md).
- Initial risk register + this treatment plan.

## Revision history

| Version | Date | Author | Summary of changes |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Initial stub |
| 0.2 | 2026-08-25 | BizCode | Initial treatment actions for #196 |
