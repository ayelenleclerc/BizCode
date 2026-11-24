# BizCode Local — security hardening (#538)

**Purpose:** Threat model, controls, verification, and secure-configuration guidance for **BizCode Local** (distributor program [#535](https://github.com/ayelenleclerc/BizCode/issues/535)). Complements [security.md](../security.md); does **not** replace hosted SaaS controls or claim absolute security.

**Related:** [local-deployment-topology.md](local-deployment-topology.md) / [ADR-0029](../adr/ADR-0029-local-deployment-topology.md) (#537), [local-distributor-scope-matrix.md](local-distributor-scope-matrix.md) (#536), [iam-model-sessions-audit.md](iam-model-sessions-audit.md), [rbac-matrix-roles-permissions-scopes.md](rbac-matrix-roles-permissions-scopes.md), [secrets-management-and-doppler.md](secrets-management-and-doppler.md), [incident-response.md](incident-response.md), [pre-commercial-security-readiness.md](pre-commercial-security-readiness.md) (#194), [backup-and-restore.md](backup-and-restore.md).

**Baseline tip:** `develop` @ post-#537 (`92bf2ceb` lineage).

## Status legend (matrix)

| Status | Meaning |
|---|---|
| **verificado** | Control + automated test or documented command with evidence in repo |
| **parcial** | Control exists; Local-specific residual remains |
| **pendiente** | Gap tracked (#539 installer/updater, #194 external pentest, etc.) |

## Threat matrix (Local)

| Threat surface | Attack / failure | Control (evidence) | Test / verification | Residual risk | Status |
|---|---|---|---|---|---|
| Principal host API | Bind on all interfaces → LAN/WAN scan | `BIZCODE_LISTEN_HOST`; default `127.0.0.1` when `NODE_ENV` is `development`/`test`; production unbound host for containers | `tests/server/server.test.ts`, `tests/server/env.test.ts` | Explicit LAN bind still needs OS firewall | verificado |
| PostgreSQL | Exposed to Internet | Ops: bind Postgres to localhost/LAN only; never open `5432` publicly; secrets in env not in repo | Manual checklist below; no installer automation yet (#539) | Misconfiguration by operator | parcial |
| Workstation (puesto) | Stolen session / weak role | Server-side `requirePermission`, tenant/RLS, scopes | `tests/api/authz.test.ts`, `tenant-isolation.test.ts`, `rls-isolation.test.ts` | Privileged local OS user can read env on principal | verificado |
| Auth tokens | Invalid / expired / revoked refresh | Session + refresh rotation | `auth-session`, `auth-refresh`, `auth-lockout` | Cookie `Secure` + plain HTTP LAN may fail browsers | parcial |
| MFA critical roles | TOTP bypass | MFA flows when enabled | `tests/api/auth-mfa.test.ts` | Not forced for every Local role by default | parcial |
| Secrets | Leak in API/logs/exports | Env Zod bootstrap; error handler hides stack in production; no secrets in `.env.example` values | Env validation tests; CI secret scan | OS DPAPI store **Not evidenced** — use OS credential manager / file ACLs on principal | parcial |
| Tauri shell | XSS / navigation / unsigned update | Current: `csp: null`, `shell.open` only; **no** signed updater | Code review `src-tauri` | Updater integrity → [#539](https://github.com/ayelenleclerc/BizCode/issues/539) | pendiente |
| Portal / webhooks | Public edge without TLS | Topology: need controlled edge or hosted path; `API_PUBLIC_URL` | Contract/API tests for portal; webhook allowlists where coded | Local-only API cannot receive public webhooks without tunnel | parcial |
| Connectors (MP/MeLi/…) | Credential abuse | Provider secrets in env; modules gated | Domain API tests + mocks | Live credentials out of Local secure baseline | parcial |
| Installer / updates | Tampered binary | **Not evidenced** | — | [#539](https://github.com/ayelenleclerc/BizCode/issues/539) | pendiente |
| External pentest | Unknown High/Critical | ZAP/CI partial; register empty | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) | Keep-OPEN; no fake “passed” claim | pendiente |

## Negative authorization evidence (commands)

```bash
pnpm exec vitest run tests/api/authz.test.ts tests/api/auth-session.test.ts tests/api/auth-refresh.test.ts tests/api/tenant-isolation.test.ts tests/api/rls-isolation.test.ts tests/api/portal-isolation.test.ts tests/server/server.test.ts tests/server/env.test.ts
```

Coverage includes: unauthenticated 401, forbidden 403, cross-tenant isolation, invalid credentials, revoked refresh reuse, MFA invalid TOTP, listen-host defaults.

## Secure configuration manual (Local)

### Individual install (single PC)

1. Set `NODE_ENV=development` (or run via documented scripts) so the API defaults to **`127.0.0.1`** unless overridden.
2. Leave `BIZCODE_LISTEN_HOST` unset, or set `BIZCODE_LISTEN_HOST=127.0.0.1`.
3. Keep PostgreSQL listening on localhost only (`listen_addresses` / Windows firewall deny inbound `5432` from non-local).
4. Put `DATABASE_URL`, `JWT_SECRET`, fiscal/MFA encryption keys only on the principal host (file ACL / OS secret store). **Do not** copy `.env` to every puesto.
5. Do **not** disable antivirus or firewall as an install step.
6. Prefer browser/Tauri against `http://127.0.0.1:3001` (loopback). Cookie `Secure` may require HTTPS for non-loopback hosts — prefer loopback or terminate TLS at a reverse proxy.

### LAN multi-workstation

1. Set `BIZCODE_LISTEN_HOST` to the principal LAN IP (or `0.0.0.0` only if firewall restricts to LAN subnets).
2. Open **only** the API port (default `3001`) to trusted LAN; keep Postgres **not** reachable from puestos (puestos use HTTP API only).
3. Set `CORS_ORIGINS` to explicit workstation origins if not using localhost defaults.
4. Document owner-approved residual: HTTP on LAN without TLS.

### Secret rotation / recovery

1. Rotate `JWT_SECRET` using `JWT_SECRET_PREVIOUS` rolling window ([secrets-management-and-doppler.md](secrets-management-and-doppler.md)).
2. Rotate fiscal/MFA encryption keys per existing server helpers; invalidate sessions after material auth secret changes.
3. Restore from encrypted backup drills ([backup-and-restore.md](backup-and-restore.md)); Local-specific automation → [#540](https://github.com/ayelenleclerc/BizCode/issues/540).

### Incident response

Follow [incident-response.md](incident-response.md). Local extras: isolate principal host from WAN; revoke sessions; rotate `JWT_SECRET` and DB password; preserve audit logs without exporting PII to chat/tickets.

## Scans (in-repo)

Run CI-equivalent secret/dependency jobs available in the repository workflows and attach command + commit SHA + result to the validating PR. External/manual pentest register remains under **#194** (keep OPEN). Do not claim scans that were not executed.

## Explicit non-goals / residuals

- Signed Tauri auto-update and hardened CSP → **#539**
- Full Local installer service ACL → **#539**
- Contracted external pentest closure → **#194**
- Changing SaaS cookie policy for LAN HTTP → follow-up if product requires non-TLS LAN cookies

## Other languages

[Español](../../es/quality/endurecimiento-seguridad-local.md) · [Português (Brasil)](../../pt-br/quality/endurecimento-seguranca-local.md)
