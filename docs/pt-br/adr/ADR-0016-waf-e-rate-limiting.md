# ADR-0016: Contrato WAF de borda (Cloudflare) + rate limiting com Redis

**Status:** Aceito  
**Data:** 2026-07-28  
**Referência ISO:** ISO/IEC 27001:2022 A.8.9 (gestão de configuração); A.8.20 (segurança de redes); A.5.15 (controle de acesso)

---

## Contexto

O BizCode já aplica rate limits HTTP por rota com `express-rate-limit` (#87) usando **store em memória do processo**, chave principalmente por IP, montado antes de resolver sessão. Redis (`REDIS_URL`) serve blacklist de refresh (#212) e desafios MFA (#213), não contadores HTTP. O issue #217 exige limites seguros multi-instância, chaves autenticado vs anônimo, login mais estrito, `Retry-After` em 429 e postura WAF Cloudflare documentada. **Não** há SDK Cloudflare no repositório.

## Decisão

1. **Cloudflare = contrato de implantação (somente docs):** o operador coloca Cloudflare (Free mínimo) na frente da origem e ativa WAF/bot/geo/SSL/Under Attack Mode conforme o guia. O app **não** chama APIs da Cloudflare na v1. O guia vive em `docs/*/quality/` via [`DOCUMENT_LOCALE_MAP.md`](../../DOCUMENT_LOCALE_MAP.md) (não um `docs/deployment/cloudflare.md` monolíngue).
2. **Store de rate limit:** `rate-limit-redis` + `ioredis` compartilhado se houver `REDIS_URL`; senão, memória (local/uma instância). Prefixos `bizcode:rl:*`. Em `NODE_ENV=production`, `REDIS_URL` é **obrigatório** (fail-fast em `loadAppConfig`).
3. **Trust proxy:** `TRUST_PROXY` opcional (hops, tipicamente `1` atrás da Cloudflare) configura Express `trust proxy` para que `req.ip` seja o cliente. Padrão off no local.
4. **Ordem de middleware:** limiters gerais de API **depois** de `express.json()` e `resolveSession` para chavear por `userId`. Limiters de login IP/username nas rotas `/api/auth` com body JSON.
5. **Limites padrão (override por env):** login **5 / 15 min por IP**; login **10 / hora por tenant+username**; API não autenticada **20 / min por IP**; API autenticada **100 / min por usuário**; relatórios/exports **10 / hora por tenant**; limiters import/portal/MP existentes mantidos com Redis quando há URL.
6. **Webhooks:** `WEBHOOK_IP_ALLOWLIST` opcional (IPs separadas por vírgula). Se definido, IP não listada → **403**. Faixas Mercado Pago **não** hard-coded.
7. **Fora de escopo v1:** `express-slow-down`, automação Cloudflare, scanning de dependências (#219).

## Consequências

- **Positivo:** limites multi-instância; orçamentos AC; WAF de borda documentado sem inventar IDs de conta; evidência ISO de rede/acesso.
- **Negativo:** prod exige Redis; `TRUST_PROXY` mal configurado permite spoofing; coexistem lockout DB (`ACCOUNT_LOCKED`) e HTTP 429.
- **Testes:** suíte de rate limit (#87) ampliada; casos login/`Retry-After`/user-vs-IP; store Redis quando há `REDIS_URL`.

## Referências

- Issue #217
- [ADR-0015: Gestão de segredos](ADR-0015-gestao-segredos.md)
- [Cloudflare borda e WAF](../quality/cloudflare-borda-e-waf.md)
