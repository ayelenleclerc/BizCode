# Guia de ambiente local de desenvolvimento

Onboarding para contribuidores: PostgreSQL, migrações, seed e API + Vite localmente. Paridade com CI/testes: [paridade-ambientes-testes.md](paridade-ambientes-testes.md).

## Layout do monorepo

BizCode usa **pnpm workspaces** e **Turborepo** (#154):

| Caminho | Papel |
|---------|-------|
| `apps/web/` | Frontend React + Vite |
| `apps/server/` | API Express |
| `apps/seller/` | Expo (React Native) App Vendedor — vendas em campo (#167–#172) |

| `packages/types/` | Tipos TypeScript e contratos RBAC compartilhados |
| `packages/api-client/` | Cliente HTTP da API |
| `prisma/` | Esquema e migrações (raiz do repositório) |
| `tests/`, `e2e/` | Suítes de teste compartilhadas (raiz) |

Instale e execute comandos a partir da **raiz do repositório**.

### Cliente API (`@bizcode/api-client`)

O cliente HTTP compartilhado fica em `packages/api-client/`. Ele não lê mais variáveis do Vite diretamente (pronto para React Native): `apps/web` chama `initApiClientFromEnv()` de `apps/web/src/lib/api-config.ts` em `main.tsx` antes do render, vinculando `VITE_API_URL` via `configureApiClients()`. URL base padrão quando ausente: `http://localhost:3001/api`. APIs por domínio em `packages/api-client/src/modules/`; `createApiClient()` / `createPortalApiClient()` aceitam base URL opcional para outros hosts.

Opcional em `.env` para o app web:

- `VITE_API_URL` — base completa da API incluindo `/api` (ex.: `http://localhost:3001/api`)

### App Vendedor (`apps/seller`, #167–#172)

App Expo SDK com Expo Router. A UI usa React Native Paper (`@bizcode/ui` fica diferido para #157). Auth em modo **Bearer dual**: a API continua definindo cookies HttpOnly para a web e também devolve `accessToken` / `refreshToken` / `expiresIn` no body de login e refresh. O app seller guarda esses tokens no **expo-secure-store** (nunca AsyncStorage) e envia `Authorization: Bearer` mais `x-bizcode-channel: field`.

Papéis permitidos: `seller`, `manager`, `owner`. Outros papéis veem uma tela acessível de negação “somente vendedor”.

**Clientes (#168):** busca online (`GET /api/clientes?q=`) e ficha com abas Conta / Pedidos / Dados (saldo via `GET …/cuenta-corriente/saldo` se `finance.ledger` estiver habilitado, faturas vencidas via `GET …/facturas-pendientes` se `finance.receipts` estiver habilitado, últimos pedidos, contato + discador nativo, score e zona). Papéis com `customers.read` podem chamar esses dois GET (ledger completo / escrita de recibos ainda exige `reports.financial.read`). Cache offline → **#171**.

**Tomada de pedidos (#169):** a partir da ficha, **Novo pedido** abre `/pedidos/nuevo?clienteId=` com catálogo online (`GET /api/articulos`, rubros), carrinho em memória, resumo (desconto por linha, `condicionCobro` / `plazoDias`, `observaciones` para depósito), depois `POST /api/pedidos` + `POST …/confirm`. Estoque e crédito excedido são apenas avisos. Fila offline / cache de catálogo → **#171**.

**Agenda / Minha Rota Hoje (#170 + #267):** aba `/agenda` é **Minha Rota Hoje**: `GET/POST /api/rutas`, reordenar/substituir paradas, `PATCH` estado (`visitado` → `/(app)/pedidos/nuevo?clienteId=` e cria/atualiza `VisitaVendedor`; `postergado` → próximo dia sem `Feriado`; `no_visitado` + motivo). Banner de feriado via `GET /api/feriados?fecha=`. Pins do mapa (`react-native-maps`) só se houver `Cliente.latitud`/`longitud` (sem geocoder). Outbox offline ampliada para mutações de rota. Managers veem progresso na web `/visitas` (`GET /api/rutas/:id/stats`, polling 60s) e atribuem `VendedorZona`. Seed feriados AR: `npm run feriados:seed-ar`.

**Modo offline (#171):** após login (online), hydrate do dia em `expo-sqlite` (clientes, artigos, rubros, agenda/rota, feriados do dia, pedidos recentes) com metadados MMKV (`cacheDay`; fallback em memória se MMKV nativo indisponível). Sem sinal, listas/ficha/catálogo/rota/confirmação de pedido leem SQLite e enfileiram escritas (pedidos + visitas + rotas) na outbox FIFO esvaziada pelo NetInfo ao reconectar. Banner com data offline e pendentes. Invalidação ao mudar o dia local. Alvo principal nativo Expo; o mapa pode exigir development build.

**Notificações push (#172):** após autenticar, o app pede permissão, obtém o token Expo e registra com `POST /api/users/me/push-token` (removido no logout). O backend envia Expo Push em confirm/cancel de pedido (ao `vendedorId`), alertas de crédito / pagamentos do cliente (sellers por `VendedorZona` + pedidos recentes) e chat. A aba Perfil `/perfil` silencia tipos com `GET/PUT /api/users/me/push-preferences`. O toque abre pedido ou cliente. Infra compartilhada para App Driver (#165). Entrega física exige build nativo; CI cobre API + testes unitários do sender.

**Repetir último pedido e modelos (#253):** CTA na ficha `GET /api/clientes/:id/ultimo-pedido-repeat` pré-carrega o carrinho (`CartContext.replaceLines`) com preços de lista atuais; omite inativos/pai/ausentes/serviço (banner em `/pedidos/nuevo`). Modelos: `GET|POST /api/clientes/:id/plantillas-pedido` e `GET|PATCH|DELETE /api/plantillas-pedido/:id` mais `GET …/cargar`. O hydrate offline cacheia modelos e o último pedido no SQLite. UI web manager fora de escopo.

**Alertas de dívida/estoque (#256):** políticas Seller em `TenantConfig` (defaults: acima do limite `block`, vencida `warn`, estoque zero `warn`, teto de quantidade ao estoque). O Seller lê `GET /api/tenant-config/seller-policies` (`orders.create`); owner/manager faz patch com `settings.business.manage` ou `users.manage`. A ficha abre diálogo via `GET /api/clientes/:id/estado-credito` (níveis `ok`/`amarillo`/`naranja`/`rojo`). O carrinho usa `GET /api/articulos/stock-multiple?ids=` para cores e teto; o resumo pode bloquear o confirm. O hydrate offline cacheia crédito/estoque/políticas com banner `asOf`. Sem cobranças in-app nem aprovação manager.

Strings de UI com **i18next** (EN / ES / pt-BR) e `expo-localization` para o idioma do dispositivo.

```bash
# Terminal 1 — API
pnpm run server

# Terminal 2 — Expo
pnpm --filter @bizcode/seller start
```

Env opcional (Expo public):

- `EXPO_PUBLIC_API_BASE_URL` — padrão `http://localhost:3001/api`

Type-check:

```bash
pnpm --filter @bizcode/seller type-check
```

**CORS / Expo web:** as origens padrão incluem Vite (`5173`/`4173`) e Expo web (`8081`, `19006`). Para um dispositivo ou origem customizada, defina `CORS_ORIGINS` (separado por vírgulas) no `.env`. Expo Go nativo / development builds normalmente não enviam header `Origin` de navegador.

**Dispositivo físico:** aponte `EXPO_PUBLIC_API_BASE_URL` para o IP LAN da máquina (ex.: `http://192.168.x.x:3001/api`), não `localhost`.

**Nota:** `@bizcode/ui` (#157) está fora do escopo de #167/#168; não bloquear type-check nem login por esse pacote.

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
| `pnpm --filter @bizcode/seller start` | Expo App Vendedor (Expo Go / simulador) |
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
