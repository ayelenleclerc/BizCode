# Guia de ambiente local de desenvolvimento

Onboarding para contribuidores: PostgreSQL, migrações, seed e API + Vite localmente. Paridade com CI/testes: [paridade-ambientes-testes.md](paridade-ambientes-testes.md).

## Requisitos

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **Rust** ≥ 1.77 (stable) para builds Tauri
- **PostgreSQL** 15 ou 16, ou **Docker** com o compose do repositório
- **npm** com `legacy-peer-deps` ([`.npmrc`](../../../.npmrc))

## Clone e instalação

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
npm ci
```

## Variáveis de ambiente

Copie [`.env.example`](../../../.env.example) para `.env` e defina ao menos:

- `DATABASE_URL`
- `JWT_SECRET` (obrigatório fora de testes; ver `server/config/env.ts`)
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

`npm run seed` executa `prisma/seed.ts` via `tsx`. Após o seed: tenant `platform`, usuário `ayelen`, senha conforme `BIZCODE_SEED_SUPERADMIN_PASSWORD` ([README.md](../../../README.md)).

## Execução

| Comando | Uso |
|---------|-----|
| `npm run dev:full` | API sidecar + Vite |
| `npm run server` | Somente API (`http://localhost:3001`) |
| `npm run dev:vite` | Somente Vite (`http://localhost:5173`) |
| `npm run dev` | Tauri (requer Rust) |

Swagger UI com API ativa: `http://localhost:3001/api-docs/`.

## Solução de problemas

- **Login sem alcançar o servidor:** API na porta 3001 (`npm run server` ou `npm run dev:full`); verifique `POST /api/auth/login` na rede.
- **Conflito de portas:** porta padrão documentada da API é 3001.
- **Erros de BD:** `DATABASE_URL`, PostgreSQL em execução e `npx prisma migrate dev`.
- **Falhas no build Tauri:** toolchain Rust stable e dependências do Tauri 1.5.
- **PowerShell e `npm`:** Command Prompt, Git Bash ou `npm.cmd` ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).
