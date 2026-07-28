# Cloudflare borda e WAF (#217)

## Propósito

Checklist do operador para colocar a **Cloudflare** na frente da API/origem BizCode. O aplicativo **não** chama APIs da Cloudflare; a configuração de borda fica no painel da Cloudflare (ou IaC fora deste repositório).

Decisão normativa: [ADR-0016](../adr/ADR-0016-waf-e-rate-limiting.md).

## Companion na camada de aplicação

O BizCode aplica rate limits HTTP no Express (`apps/server/middleware/routeRateLimit.ts`) com **store Redis** quando há `REDIS_URL` (obrigatório em produção). Atrás da Cloudflare é preciso definir:

| Variável | Valor típico | Motivo |
|----------|--------------|--------|
| `TRUST_PROXY` | `1` | Para que o Express `req.ip` seja o IP do cliente (CF → origem = 1 hop) |
| `REDIS_URL` | URL do Redis | Contadores compartilhados entre instâncias |
| `WEBHOOK_IP_ALLOWLIST` | CSV opcional de IPs do provedor | Se definido, webhooks respondem 403 a outros IPs |

**Não** inventar IDs de conta nem nomes de zona Cloudflare neste repositório.

## Checklist do operador (Cloudflare Free mínimo)

1. **DNS / proxy:** Hostname público na Cloudflare; nuvem laranja (proxied) para a origem.
2. **SSL/TLS:** Full (strict) se a origem tiver certificado válido; senão Full até haver TLS na origem. Preferir certificados gerenciados na borda.
3. **Regra WAF (auth):** Rate-limit ou bloqueio ~100 req/min para `/api/auth*` (orçamento de borda; o app também aplica 5 tentativas de login / 15 min por IP).
4. **Bot Fight / challenge:** Ativar challenge gerenciado para bots conhecidos se a UX permitir.
5. **Geo (opcional):** Bloquear ou desafiar países de alto risco só com lista aprovada por produto/ops.
6. **Under Attack Mode:** Documentar como ativar em DDoS; implica challenges extras para humanos.
7. **Webhooks:** Preferir allowlist na origem via `WEBHOOK_IP_ALLOWLIST` (mantida pelo operador a partir da documentação do provedor, p.ex. IPN Mercado Pago). Se a Cloudflare estiver na frente do webhook, evitar challenges incorretos às IPs do provedor.

## Local / CI

Cloudflare não é obrigatória no local. Usar [`.env.example`](../../../.env.example) e Redis opcional com `docker compose -f docker-compose.redis.yml up -d`.

## Fora de escopo no app

- Workers, Terraform ou tokens de API Cloudflare neste repo
- `express-slow-down` (v1)
- Faixas IP de terceiros hard-coded (mudam; manter em env/ops)
