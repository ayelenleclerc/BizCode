# Observabilidade MVP (Issue #151)

## Escopo

O BizCode passa a ter uma camada base de observabilidade para operação backend sem infraestrutura externa de monitoramento:

- Logs JSON estruturados com `pino`.
- Correlação por requisição com `X-Request-Id`.
- Métricas técnicas em memória via `GET /api/metrics`.
- Health expandido de forma aditiva em `GET /api/health`.

Fora do escopo deste MVP: Prometheus, Grafana, Loki, Datadog, Sentry e alertas operacionais reais (email/Slack/WhatsApp).

## Logs estruturados

- Nível de log definido por `LOG_LEVEL` (padrão `info`, `silent` em testes).
- Campos sensíveis são redigidos (`password`, `token`, `authorization`, `cookie`, `session`, `secret`, `privateKey`, `certificate`).
- Logs de request armazenam apenas metadados operacionais (`requestId`, `method`, `path` normalizado, `statusCode`, `durationMs`; `tenantId` e `userId` quando disponíveis no servidor).
- O `req.body` completo não é logado.

Privacidade por padrão:

- IP e User-Agent **não** são logados por padrão na linha de acesso por requisição.

## Endpoint de métricas

`GET /api/metrics` retorna agregados técnicos em memória e exige permissão `audit.read`.

Regras de segurança e minimização:

- Não expõe tenantId, userId, IP, User-Agent nem payload por requisição.
- Rotas são normalizadas para evitar alta cardinalidade e vazamento de identificadores reais.
- Se `METRICS_ENABLED=false`, retorna `404 Not found`.

## Endpoint health

`GET /api/health` mantém compatibilidade (`status`, `timestamp`) e adiciona:

- Resultado da checagem de DB (`db.ok`) e latência (`db.latencyMs`).
- `uptimeSeconds`.
- `version` quando disponível no runtime.

## Limites atuais e evolução futura

As métricas atuais são:

- Em memória.
- Voláteis (resetam no restart do processo).
- Não persistentes e não agregadas entre múltiplas instâncias.

Este MVP prepara o caminho para integrações futuras (Prometheus/Grafana/Loki/Sentry) quando houver infraestrutura e canais operacionais definidos.

## Validação local

Executar:

```bash
npm run check:openapi
npm run check:openapi-sync
npm run test
```

Gate completo (inclui documentação gerada):

```bash
npm run type-check
npm run lint
npm run check:i18n
npm run check:docs-map
npm run check:openapi
npm run check:openapi-sync
npm run test
npm run docs:generate
npm run docs:validate
```
