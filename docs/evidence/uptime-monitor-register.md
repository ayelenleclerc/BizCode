# Uptime monitor register (#197)

**Purpose:** Metadata index for **external** uptime monitors and the public status surface. Do not invent live URLs. Do not claim 99.9% contractual uptime until a real monitor entry exists.

**Evidence status:** Empty — no external monitor archived yet.

## How operators complete this register

1. Deploy or confirm a reachable `GET https://<host>/api/health` (and preferably `https://<host>/status`).
2. Create an external monitor (e.g. UptimeRobot / Better Stack) against the health URL; note interval and alert contacts.
3. Replace the pending placeholders in the summary table below with real values (no fictional hosts).
4. Append a dated row under **Entries**.
5. Re-run staging DR when `STAGING_DEPLOY_*` exist (`pnpm run dr:staging:check`); keep [#197](https://github.com/ayelenleclerc/BizCode/issues/197) open until both this register and a timed staging drill are evidenced.

| Field | Value |
|-------|--------|
| Monitor vendor | _(pending — e.g. UptimeRobot, Better Stack)_ |
| Health check URL | _(pending — typically `GET https://<host>/api/health`)_ |
| First-party status page path | `/status` (in-repo UI; reads `/api/health`) |
| Public status page URL (deployed) | _(pending — `https://<host>/status` after deploy)_ |
| External status page (optional) | _(pending — Statuspage.io / Better Stack page)_ |
| Check interval | _(pending)_ |
| Alert contacts | _(pending)_ |
| Related issue | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |

## Entries

| Date | Vendor | Health URL | Status URL | Notes |
|------|--------|------------|------------|-------|
| — | — | — | — | No entry yet |

## Related

- [SLA](../en/quality/sla.md)
- [Disaster recovery](../en/quality/disaster-recovery.md)
- First-party UI: `apps/web/src/pages/status/`
- Staging drill precondition: `pnpm run dr:staging:check`
