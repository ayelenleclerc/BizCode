# Guia de ambiente local de desenvolvimento

Onboarding para contribuidores: PostgreSQL, migrações, seed e API + Vite localmente. Paridade com CI/testes: [paridade-ambientes-testes.md](paridade-ambientes-testes.md).

## Layout do monorepo

BizCode usa **pnpm workspaces** e **Turborepo** (#154):

| Caminho | Papel |
|---------|-------|
| `apps/web/` | Frontend React + Vite |
| `apps/server/` | API Express |
| `packages/types/` | Tipos TypeScript e contratos RBAC compartilhados |
| `packages/api-client/` | Cliente HTTP da API |
| `prisma/` | Esquema e migrações (raiz do repositório) |
| `tests/`, `e2e/` | Suítes de teste compartilhadas (raiz) |

Instale e execute comandos a partir da **raiz do repositório**.

### Cliente API (`@bizcode/api-client`)

O cliente HTTP compartilhado fica em `packages/api-client/`. Ele não lê mais variáveis do Vite diretamente (pronto para React Native): `apps/web` chama `initApiClientFromEnv()` de `apps/web/src/lib/api-config.ts` em `main.tsx` antes do render, vinculando `VITE_API_URL` via `configureApiClients()`. URL base padrão quando ausente: `http://localhost:3001/api`. APIs por domínio em `packages/api-client/src/modules/`; `createApiClient()` / `createPortalApiClient()` aceitam base URL opcional para outros hosts.

Opcional em `.env` para o app web:

- `VITE_API_URL` — base completa da API incluindo `/api` (ex.: `http://localhost:3001/api`)

## Requisitos

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **pnpm** 10.x (`packageManager` na raiz; `corepack enable`)
- **Rust** ≥ 1.77 (stable) para builds Tauri
- **PostgreSQL** 15 ou 16, ou **Docker** com o compose do repositório

## Clone e instalação

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
corepack enable
pnpm install --frozen-lockfile
```

### Notas Windows (pnpm)

Se `pnpm install` falhar com `EPERM` / `ENOENT` ao renomear pacotes em `node_modules`, use o helper do Windows (retries + exclusões opcionais de **caminhos** do Defender só para este repositório e o store do pnpm; **não** desativa a proteção em tempo real):

```bat
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1 -FrozenLockfile
```

As configurações do editor excluem `node_modules` do file watcher (`.vscode/settings.json`). Prefira hardlinks em vez de `package-import-method=copy` (veja `.npmrc` na raiz e [CONTRIBUTING.md](../../../CONTRIBUTING.md)).

## Variáveis de ambiente

Copie [`.env.example`](../../../.env.example) para `.env` e defina ao menos:

- `DATABASE_URL`
- `JWT_SECRET` (obrigatório fora de testes; ver `apps/server/config/env.ts`)
- `BIZCODE_SEED_SUPERADMIN_PASSWORD` (≥ 8 caracteres antes de `npx prisma db seed`)

Demais variáveis opcionais estão em `.env.example`.

## PostgreSQL

**Docker (recomendado):**

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Ajuste `DATABASE_URL` à porta publicada em `docker-compose.postgres.yml`.

**Instalação nativa:** crie um banco vazio e configure `DATABASE_URL`.

## Esquema e seed

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`pnpm run seed` executa `prisma/seed.ts` via `tsx`. Após o seed: tenant `platform`, usuário `ayelen`, senha conforme `BIZCODE_SEED_SUPERADMIN_PASSWORD` ([README.md](../../../README.md)).

## Execução

| Comando | Uso |
|---------|-----|
| `pnpm run dev:full` | API sidecar + Vite |
| `pnpm run server` | Somente API (`http://localhost:3001`) |
| `pnpm run dev:vite` | Somente Vite (`http://localhost:5173`) |
| `pnpm run dev` | Tauri (requer Rust) |

Swagger UI com API ativa: `http://localhost:3001/api-docs/`.

## Portão de qualidade (local)

```bash
pnpm run type-check
pnpm run test
pnpm run test:coverage
pnpm run test:integration
pnpm run test:e2e
```

## Solução de problemas

- **Login sem alcançar o servidor:** API na porta 3001 (`pnpm run server` ou `pnpm run dev:full`); verifique `POST /api/auth/login` na rede.
- **Conflito de portas:** porta padrão documentada da API é 3001.
- **Erros de BD:** `DATABASE_URL`, PostgreSQL em execução e `npx prisma migrate dev`.
- **Falhas no build Tauri:** toolchain Rust stable e dependências do Tauri 1.5.
- **PowerShell:** Command Prompt, Git Bash ou `pnpm.cmd` ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).
