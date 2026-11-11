# Uptime monitor register (#197)

**Purpose:** Metadata index for **external** uptime monitors and the public status surface. Do not invent live URLs. Do not claim 99.9% contractual uptime until a real monitor entry exists.

**Evidence status:** Empty — no external monitor archived yet.

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
