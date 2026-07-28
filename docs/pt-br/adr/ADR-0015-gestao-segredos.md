# ADR-0015: Gestão de segredos (injeção Doppler + HMAC dual)

**Status:** Aceito  
**Data:** 2026-07-28  
**Referência ISO:** ISO/IEC 27001:2022 A.5.10 (uso aceitável da informação); A.8.24 (criptografia); A.5.15 (controle de acesso)

---

## Contexto

O BizCode carregava segredos apenas do ambiente / `.env` local (`DATABASE_URL`, `JWT_SECRET`, chaves AES fiscal/MFA). Credenciais AFIP e Mercado Pago em repouso já usam AES-256-GCM ([`fiscalSecrets.ts`](../../../apps/server/fiscal/ar/fiscalSecrets.ts)); MFA usa chave dedicada ([`mfaSecrets.ts`](../../../apps/server/lib/mfaSecrets.ts)). A issue #216 exige que em produção não vivam em `.env` versionados, rotação HMAC sem reinício simultâneo de todas as instâncias, e varredura de segredos no CI.

Apesar do nome histórico `JWT_SECRET`, tokens de sessão e portal são valores **opacos** com hash HMAC-SHA256, não JWT assinados.

## Decisão

1. **Fonte em produção = Doppler (opção A da issue):** Doppler (ou orquestrador equivalente) **injeta** segredos no ambiente do processo na inicialização. O app Node **não** embute SDK AWS Secrets Manager / Vault na v1; continua lendo env validado via [`loadAppConfig`](../../../apps/server/config/env.ts).
2. **Local / test / CI:** `.env` (gitignored) e `env:` do GitHub Actions permanecem válidos. Nunca commitar valores reais de produção; [`.env.example`](../../../.env.example) só placeholders.
3. **Rotação HMAC sem downtime:** `JWT_SECRET` (atual; hasheia novas emissões) e opcional `JWT_SECRET_PREVIOUS`. Lookups usam candidatos de [`secretHmac.ts`](../../../apps/server/lib/secretHmac.ts) para aceitar tokens hasheados com o segredo anterior até expirarem ou renovarem.
4. **Chaves AES:** `BIZCODE_FISCAL_ENCRYPTION_KEY` e `BIZCODE_MFA_ENCRYPTION_KEY` obrigatórias com `NODE_ENV=production` (sem defaults inseguros).
5. **CI:** Gitleaks em push/PR; auditoria de histórico `**/.env*` documentada; rewrite BFG fora de banda.
6. **Fora de escopo v1:** SDK AWS, Vault, rotação AES automática, WAF (#217).

## Consequências

- **Positivo:** Produção sem `.env` com segredos reais; rotação gradual de sessões/portal; CI detecta commits acidentais.
- **Negativo:** É preciso configurar Doppler (ou injeção equivalente); a janela do segredo previous deve ser limitada.
- **Testes:** [`tests/server/lib/secretHmac.test.ts`](../../../../tests/server/lib/secretHmac.test.ts) e endurecimento de env/fiscal/MFA.

## Referências

- Issue #216
- [ADR-0007: Implantação dual e modularidade fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [Gestão de segredos e Doppler](../quality/gestao-segredos-e-doppler.md)
