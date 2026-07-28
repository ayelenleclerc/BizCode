# Gestão de segredos e Doppler (#216)

## Objetivo

Documentar como o BizCode carrega configuração sensível em produção versus local/CI, sem SDKs de provedor cloud no aplicativo.

Decisão normativa: [ADR-0015](../adr/ADR-0015-gestao-segredos.md).

## Modelo

| Ambiente | Como os segredos chegam ao processo |
|----------|-------------------------------------|
| Desenvolvimento local | `.env` gitignored (copiar de [`.env.example`](../../../.env.example)) |
| CI (GitHub Actions) | `env:` do workflow / secrets do repositório |
| Produção | **Doppler** (ou equivalente) injeta env na inicialização. **Não** montar `.env` de produção com valores reais na imagem/repo |

A API sempre lê variáveis validadas em `apps/server/config/env.ts`.

## Inventário canônico (sensíveis)

| Variável | Papel |
|----------|-------|
| `DATABASE_URL` | Conexão PostgreSQL (inclui senha do DB) |
| `JWT_SECRET` | Chave HMAC atual para hashes de tokens opacos |
| `JWT_SECRET_PREVIOUS` | Chave HMAC anterior opcional na rotação |
| `BIZCODE_FISCAL_ENCRYPTION_KEY` | Chave mestre AES-256-GCM AFIP/MP (**obrigatória em production**) |
| `BIZCODE_MFA_ENCRYPTION_KEY` | Chave AES-256-GCM TOTP (**obrigatória em production**; não reutilizar a fiscal) |
| `REDIS_URL` | Redis (blacklist refresh, desafios MFA, **store de rate-limit HTTP** — **obrigatório em produção**, #217) |
| `SMTP_*` / `TWILIO_*` | Canais de saída opcionais |

## Rotação de `JWT_SECRET`

1. Colocar o valor **antigo** em `JWT_SECRET_PREVIOUS`.
2. Colocar o valor **novo** em `JWT_SECRET`.
3. Reiniciar instâncias gradualmente.
4. Remover `JWT_SECRET_PREVIOUS` quando o material hasheado com o segredo antigo expirar.

## AES

Rotacionar chaves AES exige re-cifrar ciphertext armazenado (fora do escopo automatizado de #216).

## Checklist Doppler

1. Projeto/config Doppler por ambiente.
2. Carregar o inventário como secrets Doppler.
3. Subir com injeção (`doppler run -- …` ou sync para env do container).
4. Confirmar `NODE_ENV=production` e chaves fiscal/MFA.
5. Separar secrets de deploy CI/SSH dos de runtime quando apropriado.

## CI: Gitleaks

Workflow `.github/workflows/gitleaks.yml`. Allowlist mínima em `.gitleaks.toml` se necessário.

## Auditoria de histórico

```bash
git log --all --full-history -- "**/.env*"
```

Se houver segredos reais: rotacionar credenciais e planejar rewrite de histórico à parte.

Modelo: [`docs/evidence/secrets-env-history-audit.md`](../../evidence/secrets-env-history-audit.md).
