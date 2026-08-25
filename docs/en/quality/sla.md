# Service Level Agreement — BizCode SaaS (#197)

**Document role:** Contractual SLA template for hosted BizCode (ISO-ready / ops).  
**Related issue:** [#197](https://github.com/ayelenleclerc/BizCode/issues/197)  
**Hub:** [docs/SLA.md](../../SLA.md)

This document defines **target** service levels for BizCode **hosted / SaaS** deployments. Desktop-only installations are out of scope for uptime commitments (customer endpoint). Values below are **objectives**, not measured live evidence until operators activate public monitoring (see below).

**Legal disclaimer:** Penalty and jurisdiction clauses are a **template** for Argentina-oriented B2B SaaS. They require counsel review before inclusion in signed contracts. Not legal advice.

## Service description

BizCode provides multi-tenant business software (API + web UI) as configured for the customer’s subscription. Coverage excludes third-party outages (AFIP/ARCA, Mercado Pago, DNS/CDN not controlled by BizCode) except where BizCode misconfiguration is the root cause.

## Target metrics

| Metric | Target | How to measure (ops) | Evidence status |
|--------|--------|----------------------|-----------------|
| Monthly uptime | 99.9% (~43.8 min downtime / month) | External HTTP(S) monitor on `/api/health` (e.g. UptimeRobot) + public status page | **Not evidenced** — pending operator activation |
| API response time P95 | &lt; 500 ms (read-heavy authenticated routes under normal load) | App metrics / observability (#151) | Partial — in-app metrics exist; no contractual export evidenced |
| First support response | P1 &lt; 4 business hours; P2 &lt; 24 business hours | Ticket system (operator-owned) | **Not evidenced** in repo |
| RTO | &lt; 4 hours | Timed restore / failover drill | Local restore smoke: [SEC-015](../certificacion-iso/sec/sec-015-restore-test-evidence-register.md); staging drill **pending** |
| RPO | &lt; 24 hours | Backup schedule (nightly) | Partial — [backup-and-restore.md](backup-and-restore.md) (#150) |

Business hours default: Monday–Friday 09:00–18:00 America/Argentina/Buenos_Aires (operator may publish a different calendar in the contract).

## Uptime calculation

```
uptime% = (total_minutes_in_month − downtime_minutes) / total_minutes_in_month × 100
```

Downtime = periods when the agreed health URL fails consecutive checks beyond the monitor’s alert threshold (document the threshold on the status page).

## Exclusions (do not count as downtime)

1. Scheduled maintenance announced ≥ 48 hours in advance (or emergency maintenance with best-effort notice).
2. Force majeure (natural disaster, war, widespread ISP failure).
3. Customer misuse, bad client configuration, or customer-side network.
4. Failures of third-party services outside BizCode control (payment, fiscal, email providers).
5. Beta / preview features explicitly marked non-SLA.
6. Free trial tenants (unless the contract says otherwise).

## Credits / penalties (template)

If monthly uptime falls below target **after exclusions**, customer may request a service credit on the next invoice:

| Uptime (month) | Credit (% of monthly fee) |
|----------------|---------------------------|
| 99.0% – &lt; 99.9% | 10% |
| 95.0% – &lt; 99.0% | 25% |
| &lt; 95.0% | 50% |

Credits are the **sole remedy** under this template unless the signed MSA states otherwise. Maximum credit per month: 50% of that month’s fee. Claims within 30 days of the month end, with monitor evidence.

## Jurisdiction (template)

Governing law: República Argentina. Courts: Ciudad Autónoma de Buenos Aires, unless the MSA specifies otherwise. **Counsel must confirm.**

## Public monitoring activation (ops checklist)

Until completed, uptime SLA is **aspirational**:

1. Create UptimeRobot (or equivalent) monitor: `GET https://<prod-host>/api/health` every 5 minutes.
2. Publish a status page (Statuspage.io, Better Stack, or equivalent) with the same check.
3. Record public URLs in the emergency contacts table (operator fill-in) and in SEC-015 notes when live.
4. Do **not** claim “active public monitoring” in sales material until steps 1–3 are done.

## Related

- [Disaster recovery](disaster-recovery.md)
- [Deployment environments](deployment-environments.md)
- [Observability](observability.md)
- [SRV-003 SLA catalog](../certificacion-iso/srv/srv-003-sla-catalog.md)

## Other languages

- Español: [sla.md](../../es/quality/sla.md)
- Português: [sla.md](../../pt-br/quality/sla.md)

## Revision history

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 | 2026-08-25 | BizCode | Initial SLA template for #197 |
