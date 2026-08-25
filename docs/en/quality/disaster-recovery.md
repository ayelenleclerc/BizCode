# Disaster recovery — BizCode (#197)

**Document role:** DR runbooks for hosted BizCode (ISO-ready).  
**Related issue:** [#197](https://github.com/ayelenleclerc/BizCode/issues/197)  
**Hub:** [docs/DISASTER_RECOVERY.md](../../DISASTER_RECOVERY.md)

Does **not** claim ISO certification or a completed staging DR drill. Local restore smoke ≠ staging AC.

## Objectives

| Objective | Target | Notes |
|-----------|--------|-------|
| RTO | &lt; 4 hours | Time to restore service after declared disaster |
| RPO | &lt; 24 hours | Nightly backup window ([backup-and-restore.md](backup-and-restore.md)) |

**Not evidenced in repo:** automated DB replica / automatic failover. Recovery is **restore from backup** + redeploy.

## Emergency contacts (template — fill in ops)

| Role | Name / team | Channel | Notes |
|------|-------------|---------|-------|
| Incident commander | _(pending)_ | | |
| Platform / DBA | _(pending)_ | | |
| Hosting provider support | _(pending)_ | | |
| Product owner | _(pending)_ | | |
| Security lead | _(pending)_ | | See [incident-response.md](incident-response.md) |

## RACI (product ops)

| Activity | Eng | Platform ops | Product owner |
|----------|-----|--------------|---------------|
| Declare disaster / maintenance | C | R | A |
| Restart app containers | C | R | I |
| Backup / restore Postgres | C | R | I |
| Provider migration | C | R | A |
| Customer notification | C | C | R |
| Security containment | R | C | A |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

---

## Scenario 1 — Application server failure

**Symptoms:** API/UI unreachable; DB may still be healthy.

**Evidence in repo:** `restart: unless-stopped` and `healthcheck` on services in [`docker-compose.staging.yml`](../../../docker-compose.staging.yml) / prod compose equivalents.

**Runbook**

1. Check status page / monitor and host metrics.
2. SSH to host (staging/prod per [deployment-environments.md](deployment-environments.md)).
3. `docker compose -f docker-compose.<env>.yml ps` and inspect unhealthy containers.
4. `docker compose … restart <service>` or `up -d` after image pull.
5. Verify `GET /api/health`.
6. If restart loop: pull last known-good image tag; escalate to Eng.

---

## Scenario 2 — Database failure

**Symptoms:** API errors on DB; Postgres down or corrupt.

**Evidence:** [backup-and-restore.md](backup-and-restore.md) — `npm run backup:postgres` / `backup:postgres:restore`. **No** managed replica failover documented in-repo.

**Runbook**

1. Stop writers (scale down API or enable maintenance mode if available).
2. Identify latest good artifact under backup dir / offsite prefix.
3. Restore to a **dedicated** DB name first when possible:  
   `npm run backup:postgres:restore -- --file <artifact> --db <restore_db> --yes`
4. Point `DATABASE_URL` / compose to restored DB after verification (`SELECT 1`, spot-check tenants).
5. Bring API back; verify health and a sample authenticated read.
6. Record RTO in [SEC-015](../certificacion-iso/sec/sec-015-restore-test-evidence-register.md).

**Limitation:** Full-database logical restore — **not** table-granular restore. For selective recovery, restore to a side DB and copy rows with an approved Eng procedure (ad hoc; not automated).

---

## Scenario 3 — Full hosting provider failure

**Symptoms:** Entire region/provider unavailable.

**Runbook (checklist)**

1. Declare disaster; notify customers (status page + email/ticket).
2. Provision replacement host (DNS/TLS residual of #152 — operator-owned).
3. Install Docker + compose files from this repo; configure secrets (Doppler / env).
4. Restore latest offsite backup (`BIZCODE_BACKUP_S3_URI` or copied artifacts).
5. Run migrations if required (`prisma migrate deploy`).
6. Point DNS; verify health and smoke login.
7. Target RTO &lt; 4h depends on DNS TTL and pre-staged secrets — **practice on staging**.

---

## Scenario 4 — Accidental data deletion

**Symptoms:** Missing rows/tenants after human or script error.

**Runbook**

1. Stop further writes if ongoing.
2. Restore latest pre-incident backup to a **side database** (`--db`).
3. Extract needed data with Eng-approved SQL; apply carefully to production (change window).
4. If full rollback is acceptable: restore over the environment with `--yes` after approval.
5. Document in SEC-015 and audit trail.

**Not evidenced:** automated point-in-time table restore.

---

## Scenario 5 — Security compromise

**Symptoms:** Suspected breach, ransomware, stolen credentials.

**Runbook**

1. Follow [incident-response.md](incident-response.md) (containment, revoke sessions, disable tenant, forensic listing).
2. Rotate secrets (DB, JWT/session, provider tokens, backup key if exposed).
3. Rebuild hosts from known-good images; **do not** restore from a backup taken after compromise without forensics.
4. Restore from the last known-clean backup; verify integrity.
5. Legal / customer notification per incident-response and privacy docs.
6. Post-mortem; update this DR plan if gaps found.

---

## Semiannual DR drill (staging) — pending AC

1. Use staging host with `STAGING_DEPLOY_*` configured.
2. Snapshot/backup; simulate failure (stop services).
3. Restore from backup; measure wall-clock RTO.
4. Record in SEC-015; compare to &lt; 4h target.
5. **Issue #197 stays OPEN** until this drill and public uptime monitoring are done.

Local Docker restore smoke (dev `:5432`) is documented separately in SEC-015 and does **not** close the staging AC.

## Related

- [SLA](sla.md)
- [Backup and restore](backup-and-restore.md)
- [Incident response](incident-response.md)
- [SEC-014](../certificacion-iso/sec/sec-014-business-continuity-recovery-plan.md)

## Other languages

- Español: [recuperacion-ante-desastres.md](../../es/quality/recuperacion-ante-desastres.md)
- Português: [recuperacao-de-desastres.md](../../pt-br/quality/recuperacao-de-desastres.md)

## Revision history

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 | 2026-08-25 | BizCode | Initial DR runbooks for #197 |
