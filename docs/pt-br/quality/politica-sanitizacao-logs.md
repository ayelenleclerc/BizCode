# Política de sanitização e retenção de logs (GitHub #218)

## Escopo

Este documento cobre o **endurecimento residual** após o MVP de observabilidade ([#151](https://github.com/ayelenleclerc/BizCode/issues/151)): catálogo ampliado de redação, auditoria de superfícies fora do Pino, regras de retenção/acesso e guardrail automatizado. **Não** reimplementa métricas, health nem a base Pino (ver [observabilidade.md](observabilidade.md)).

A integração mock de impressão ([#153](https://github.com/ayelenleclerc/BizCode/issues/153) Fase 1, PR #311) está **fora de escopo**; drivers físicos fiscal/térmico permanecem como follow-up.

## Catálogo de campos sensíveis

Nomes canônicos em [`server/logRedaction.ts`](../../../server/logRedaction.ts) (`SENSITIVE_LOG_FIELD_NAMES`). Mapeiam para `redact.paths` do Pino via `LOGGER_REDACT_PATHS` em [`server/logger.ts`](../../../server/logger.ts).

| Categoria | Campos (representativos) |
|-----------|--------------------------|
| Auth / sessão | `password`, `token`, `authorization`, `cookie`, `session`, `bearer`, `jwt`, `refreshToken`, `accessToken` |
| Cripto / certificados | `secret`, `privateKey`, `private_key`, `certificate`, `clientSecret` |
| Integrações | `apiKey`, `api_key`, `smtpPassword`, `twilioAuthToken`, `x-api-key` (headers) |
| Pagamentos | `creditCard`, `cardNumber`, `cvv`, `cvc`, `cbu`, `aliasCbu` |

Objetos aninhados e headers HTTP usam caminhos wildcard (`*.password`, `req.headers.authorization`, etc.). Logs serializados usam censor `[Redacted]` (ver [`tests/server/logger.test.ts`](../../../tests/server/logger.test.ts)).

## Auditoria de superfícies de log (2026-06)

| Superfície | Risco | Ação |
|------------|-------|------|
| API Express (`server/*`) | Apenas `logger` estruturado; sem `console.*` | **OK** — linhas de request sem IP/UA por padrão ([#151](observabilidade.md)) |
| `server/middleware/errorHandler.ts` | Pode registrar `err.stack` no servidor | **Aceito** — stacks só no servidor; respostas API ocultam detalhe em produção |
| Jobs/cron CLI (`scripts/*-job.ts`, `arca-retry-pending.ts`) | `console.log(JSON.stringify(...))` | **OK** — apenas agregados (`processed`, `issued`, `failed`, `sent`, `skipped`) e `tenantId` |
| `scripts/bootstrap-superadmin.ts` | Registra username na criação | **OK** — sem senha; bootstrap só operador |
| `scripts/inspect-dbf*.ts`, `migrate-from-dbf.ts` | **Amostras** DBF legado em stdout | **Isento** — CLI só operador; não faz parte de logs de runtime da API |
| Ferramentas de plano GitHub (`scripts/github/*`) | Mensagens operacionais | **OK** — sem segredos nos templates |

## Retenção e acesso

| Ambiente | Destino | Retenção (política) | Quem acessa |
|----------|---------|---------------------|-------------|
| Dev local | stdout / terminal | Só sessão; sem coleta central | Estação do desenvolvedor |
| CI | Logs do GitHub Actions | Padrão da plataforma (~90 dias conforme política GitHub) | Mantenedores com acesso ao repositório |
| Produção (futuro) | Sink no host/orquestrador (não definido no repo) | **TBD** ao escolher destino — alinhar com [#150](https://github.com/ayelenleclerc/BizCode/issues/150) | `audit.read` para **métricas**; logs brutos restritos a ops de plataforma |

`GET /api/metrics` permanece apenas agregado e exige `audit.read` quando habilitado ([#151](observabilidade.md)). Não expor logs brutos via API.

## Guardrail preventivo

```bash
npm run check:logs
```

Implementado em [`scripts/check-log-sanitization.ts`](../../../scripts/check-log-sanitization.ts): falha se `scripts/**/*.ts` não isentos usam `console.*` com trechos proibidos (`req.body`, `password:`, `token:`, etc.). Isenções estão nesse script e na tabela de auditoria.

A CI executa via `npm run docs:validate` (junto com checks OpenAPI).

## Backlog relacionado (adiado)

| Issue | Decisão |
|-------|---------|
| [#150](https://github.com/ayelenleclerc/BizCode/issues/150) backup automático PostgreSQL | Adiado até política de destino/armazenamento |
| [#152](https://github.com/ayelenleclerc/BizCode/issues/152) pipelines staging/produção | Adiado até servidor, domínio e alvos de deploy |
| [#153](https://github.com/ayelenleclerc/BizCode/issues/153) hardware fiscal/térmico | Fase 1 (mock) entregue; drivers RS-232/ESC/POS reais pendentes |

Headers HTTP de segurança da API: evidência em [#214](https://github.com/ayelenleclerc/BizCode/issues/214), [`server/middleware/securityHeaders.ts`](../../../server/middleware/securityHeaders.ts) e [`tests/server/security-headers.test.ts`](../../../tests/server/security-headers.test.ts).

## Validação

```bash
npm run check:logs
npm run test -- tests/server/logger.test.ts tests/server/security-headers.test.ts
```
