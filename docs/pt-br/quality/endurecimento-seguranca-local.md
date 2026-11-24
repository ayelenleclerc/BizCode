# BizCode Local — endurecimento de segurança (#538)

**Propósito:** Modelo de ameaças, controles, verificação e guia de configuração segura para **BizCode Local** (programa distribuidora [#535](https://github.com/ayelenleclerc/BizCode/issues/535)). Complementa [seguranca.md](../seguranca.md); **não** substitui controles SaaS nem promete segurança absoluta.

**Relacionado:** [topologia-implantacao-local.md](topologia-implantacao-local.md) / [ADR-0029](../adr/ADR-0029-local-deployment-topology.md) (#537), [matriz-escopo-local-distribuidora.md](matriz-escopo-local-distribuidora.md) (#536), [modelo-iam-sessoes-auditoria.md](modelo-iam-sessoes-auditoria.md), [matriz-rbac-funcoes-permissoes-scopes.md](matriz-rbac-funcoes-permissoes-scopes.md), [gestao-segredos-e-doppler.md](gestao-segredos-e-doppler.md), docs de incidentes/readiness (#194), [backup-e-restauracao.md](backup-e-restauracao.md).

**Baseline:** `develop` pós-#537.

## Legenda de status

| Status | Significado |
|---|---|
| **verificado** | Controle + teste automatizado ou comando documentado |
| **parcial** | Controle existe; residual Local |
| **pendiente** | Lacuna (#539 instalador/updater, #194 pentest externo) |

## Matriz de ameaças (Local)

| Superfície | Ataque / falha | Controle | Teste | Risco residual | Status |
|---|---|---|---|---|---|
| Host principal API | Bind em todas as interfaces | `BIZCODE_LISTEN_HOST`; default `127.0.0.1` em `development`/`test` | `server.test.ts`, `env.test.ts` | LAN explícito exige firewall | verificado |
| PostgreSQL | Exposição à Internet | Ops: só localhost/LAN | Checklist; instalador → #539 | Erro do operador | parcial |
| Posto | Sessão / papel fraco | `requirePermission`, tenant/RLS | `authz`, isolation tests | Usuário OS no principal | verificado |
| Tokens | Inválido / expirado / refresh revogado | Sessão + rotação | auth-session/refresh/lockout | Cookie `Secure` + HTTP LAN | parcial |
| MFA | Bypass TOTP | Fluxos MFA | `auth-mfa.test.ts` | Não forçado em todos os papéis | parcial |
| Segredos | Vazamento API/logs | Zod env; erros prod | Tests env; CI | DPAPI **Not evidenced** | parcial |
| Shell Tauri | XSS / update sem assinatura | `csp: null`; sem updater | Revisão `src-tauri` | #539 | pendiente |
| Portal / webhooks | Edge público | Topologia #537 | Tests portal | API só-LAN | parcial |
| Conectores | Credenciais | Env + módulos | Tests + mocks | Live fora do baseline | parcial |
| Instalador / updates | Binário adulterado | **Not evidenced** | — | #539 | pendiente |
| Pentest externo | High/Critical | CI parcial | #194 | Keep-OPEN | pendiente |

## Evidência de autorização negativa

```bash
pnpm exec vitest run tests/api/authz.test.ts tests/api/auth-session.test.ts tests/api/auth-refresh.test.ts tests/api/tenant-isolation.test.ts tests/api/rls-isolation.test.ts tests/api/portal-isolation.test.ts tests/server/server.test.ts tests/server/env.test.ts
```

## Manual de configuração segura (Local)

### Instalação individual

1. API default em **`127.0.0.1`** (`development`/`test` ou `BIZCODE_LISTEN_HOST=127.0.0.1`).
2. PostgreSQL só localhost; firewall sem inbound `5432` externo.
3. Segredos só no PC principal; **não** copiar `.env` para cada posto.
4. **Não** desativar antivírus/firewall como passo de instalação.
5. Preferir loopback ou TLS em proxy.

### LAN multi-posto

1. `BIZCODE_LISTEN_HOST` = IP LAN (ou `0.0.0.0` com firewall de sub-rede).
2. Abrir só a porta da API (`3001`); Postgres inacessível dos postos.
3. `CORS_ORIGINS` explícito se necessário.
4. Residual: HTTP LAN sem TLS.

### Rotação / recuperação

1. Rotacionar `JWT_SECRET` com `JWT_SECRET_PREVIOUS`.
2. Rotacionar chaves fiscal/MFA; invalidar sessões.
3. Restore conforme backup docs; automação Local → #540.

### Incidentes

Seguir runbook de incidentes do repo. Extra Local: isolar host; revogar sessões; rotacionar segredos.

## Varreduras

Executar jobs CI equivalentes e anexar SHA + resultado ao PR. Pentest externo → **#194** OPEN.

## Residuais

- CSP/updater Tauri → **#539**
- Instalador → **#539**
- Pentest contratado → **#194**

## Outros idiomas

[English](../../en/quality/local-security-hardening.md) · [Español](../../es/quality/endurecimiento-seguridad-local.md)
