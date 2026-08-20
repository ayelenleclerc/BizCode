# Guia de ambiente local de desenvolvimento

Onboarding para contribuidores: PostgreSQL, migrações, seed e API + Vite localmente. Paridade com CI/testes: [paridade-ambientes-testes.md](paridade-ambientes-testes.md).

## Layout do monorepo

BizCode usa **pnpm workspaces** e **Turborepo** (#154):

| Caminho | Papel |
|---------|-------|
| `apps/web/` | Frontend React + Vite |
| `apps/server/` | API Express |
| `apps/seller/` | Expo (React Native) App Vendedor — vendas em campo (#167–#172) |
| `apps/driver/` | Expo (React Native) App Entregador — entregas (#159–#166) |

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

**Sugestões modo check (#254):** `GET /api/clientes/:id/sugerencias-pedido` devolve habituais (ranking por frequência em 6 meses, qty sugerida, chip de anomalia) e `ArticuloOferta` ativas que ainda não estão nos habituais. Em `/pedidos/nuevo` sem busca, as seções aparecem acima do catálogo; o primeiro add usa a qty sugerida; os tetos de estoque reutilizam #256. O hydrate offline cacheia sugestões no SQLite.

**Scanner de barras (#255):** preencher `Articulo.codigoBarras` no formulário web. Em `/pedidos/nuevo`, **Escanear código** abre `/pedidos/escanear` (`expo-camera`). Lookup: SQLite local primeiro, depois `GET /api/articulos?codigoBarras=`. Aplicar migration Prisma `20260812180000_articulo_codigo_barras_255` no Postgres Docker `:5432`.

**Numpad nativo + desconto rápido (#264):** toque na quantidade (catálogo / sugestões / resumo / scanner) abre `NumpadSheet` (sem teclado do sistema). O separador decimal segue o locale i18n do seller (`,` ES/pt-BR, `.` EN). No resumo, swipe → **% Desc** / **Remover**; o rodapé **Desconto em todas as linhas** aplica o mesmo `dscto` (0–100) a todo o carrinho. Persiste o `PedidoItem.dscto` existente (sem API nova). Os tetos de estoque #256 continuam valendo.

**Confirmação WhatsApp (#265):** após confirmar, success + detalhe mostram **Enviar por WhatsApp**. Modo link abre `wa.me/{Cliente.telef}` (só dígitos; não há `celular`). Twilio exige módulo `comms.whatsapp` e `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (ver `.env.example`). Preview `GET /api/pedidos/{id}/whatsapp-share`; envio/auditoria `POST /api/pedidos/{id}/whatsapp` `{ canal: link|twilio }` grava `AuditEvent` `whatsapp_enviado` (não existe `PedidoEvento`). Modelo opcional `TenantConfig.sellerWhatsappTemplate` em seller-policies (sem UI web nova). Mensagem ≤1024. Pedidos offline (`id < 0`) podem abrir wa.me com snapshot local; Twilio desabilitado. Aplicar migration Prisma `20260813120000_seller_whatsapp_template_265` no Postgres Docker `:5432`.

**Pedido por voz (#266, [ADR-0020](../adr/ADR-0020-seller-speech-to-order.md)):** em `/pedidos/nuevo`, **Ditar pedido**. Online: `POST /api/voice/transcribe` (Whisper, `OPENAI_API_KEY` só no **server**). Offline ou 503/timeout: STT on-device (`expo-speech-recognition`; build EAS nativo, não Expo Go). Parser + fuzzy top-3 no dispositivo; **nada** no carrinho até confirmar/descartar. Unidades → `Articulo.unidadBase` (não existe `unidadMedida`). Ruído de armazém: teste **manual**. Sem migration Prisma.

**Catálogo visual com grade (#257):** `GET /api/articulos` e `GET /api/articulos/{id}` incluem `urlThumb` opcional (`/uploads/articulos/...`, imagem principal de #235; `products.read`; sem módulo `catalog.variants`, sem CDN/S3, sem migration Prisma). Em `/pedidos/nuevo`, toggle lista/grade (MMKV `seller.catalogView`); a grade usa `FlashList` (2 colunas, 3 em telas largas) com `expo-image`, grayscale + badge sem estoque, badge de oferta de #254, headers de rubro quando o chip é “todos”. Tap abre `NumpadSheet` (#264); toque longo mostra campos existentes (descripcion, codigo, preço, estoque). O hydrate offline pré-baixa thumbs com `expo-file-system`; a busca local (`LIMIT 500`) roda primeiro com 2+ caracteres. A navegação de família continua sendo chips de **Rubro** (árvore `CategoriaArticulo` fora de escopo). Mantém-se o filtro `!esPadre`; sem seletor pai+filhos. A aba `/catalogo` permanece stub.

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

### Build EAS e OTA (#173)

Workflow Expo managed (`apps/seller`). Pastas nativas `android/` / `ios/` continuam no gitignore. **Não** há `projectId` Expo commitado.

Operador (uma vez):

1. Em `apps/seller`, `eas init` com uma conta Expo (grava o UUID real).
2. Guardar secrets do GitHub `EXPO_TOKEN` e `EAS_PROJECT_ID` (comentários em `.env.example`). Secret opcional `EXPO_PUBLIC_API_BASE_URL` entra no build nativo.
3. **Não** commitar o UUID; `app.config.ts` define `extra.eas.projectId` e `updates.url` só se `EAS_PROJECT_ID` existir. Push (#172) já lê esse extra.

Perfis em `apps/seller/eas.json`:

| Perfil | Android | iOS | Distribuição |
|---|---|---|---|
| `production` | AAB (`app-bundle`) | IPA (`simulator: false`) | `store` |
| `internal` | APK | IPA | `internal` |

OTA: `expo-updates` com `runtimeVersion.policy: appVersion` (versão `0.1.0`). CI executa `eas update --channel production` na tag `seller-v*`. Esta mudança **não** mede a latência OTA em dispositivo.

Wrappers locais (`EXPO_TOKEN` / login Expo; `eas-cli@16` via `pnpm dlx`):

```bash
pnpm --filter @bizcode/seller eas:build:production
pnpm --filter @bizcode/seller eas:build:internal
pnpm --filter @bizcode/seller eas:update
```

O primeiro upload à Play Console / App Store e Apple Developer / `eas submit` são **manuais**. O Quality Gate **não** executa EAS.

### Copy da ficha Google Play (#173)

Reutilizar ícone e splash de `apps/seller/assets/`. **Não** há screenshots de store no repositório.

URL de privacidade: `{PUBLIC_WEB_ORIGIN}/privacidad` (página pública #195; o operador indica a origem implantada).

**EN — short:** Field sales for BizCode: customers, orders, catalog, and daily route.

**EN — full:** BizCode Seller is the field-sales app for the BizCode ERP. Sellers sign in with their company account, look up customers, take orders (catalog, scanner, suggestions), confirm visits on the daily route, and work offline with later sync. Push notifications and WhatsApp confirmation use the company BizCode server. This listing does not collect store screenshots in the repository; use device captures from a signed build.

**ES — corta:** Ventas de campo para BizCode: clientes, pedidos, catálogo y ruta del día.

**ES — completa:** BizCode Seller es la app de vendedor de campo del ERP BizCode. El vendedor inicia sesión con la cuenta de la empresa, consulta clientes, toma pedidos (catálogo, escáner, sugerencias), confirma visitas en la ruta del día y trabaja sin conexión con sincronización posterior. Las notificaciones push y la confirmación por WhatsApp usan el servidor BizCode de la empresa. No hay capturas de Play Store en el repositorio; usar capturas de un build firmado.

**Nota:** `@bizcode/ui` (#157) está fora do escopo de #167/#168; não bloquear type-check nem login por esse pacote.

### App Entregador (`apps/driver`, #159–#164)

App Expo SDK com Expo Router (mesmo stack do Seller). Auth em modo **Bearer dual** com tokens no **expo-secure-store** e `Authorization: Bearer` mais `x-bizcode-channel: field`.

Papel permitido: apenas **`driver`**. Outros papéis veem tela de acesso negado.

**Rota do dia (#160):** a aba `/ruta` carrega `GET /api/repartos/mi-reparto` (`orders.deliver.confirm` + módulo `logistics.dispatches`; `choferId` é sempre o usuário autenticado). Prefere o reparto `on_route` de hoje; senão o `planned` mais recente. A lista mostra sequência, cliente, endereço, qtde de itens, chips de status e badge de dívida. O detalhe abre mapas com `Linking` (sem API key do Google Static) e `tel:` para `Cliente.telef`. **Não consegui entregar** chama o `PUT /api/repartos/:id/items/:itemId` existente com `not_delivered` + motivo (a rota deve estar `on_route`). **Cobrar** em uma parada com dívida abre `/cobros?clienteId=`. Sem migration Prisma. `GET /api/repartos/:id` também permite o motorista atribuído.

**Cobranças na entrega (#162):** a aba `/cobros` sem `clienteId` fica vazia (ir para Rota). Com um `clienteId` de `mi-reparto` de hoje, o formulário mostra `rsocial` + saldo, checkboxes de faturas (só montam o valor padrão; `POST /api/cobros` não imputa ReciboCobro), valor editável, formas de `GET /api/formas-pago`, CBU/alias de `GET /api/cobros/transfer-info` (ou mensagem i18n se não houver conta), campos de cheque como o `CobroForm` web e observações. Se o valor superar o saldo, há diálogo de confirmação. O sucesso recarrega o snapshot da rota e oferece recibo WhatsApp editável (`Linking` para `wa.me/{Cliente.telef}` só dígitos) mais `Share` nativo do mesmo texto — sem Twilio e sem PDF. Adiado: prestação de contas em dinheiro, `origenApp` / `repartoId`, PDF de servidor. O QR Mercado Pago no App Driver continua fora de escopo. O smoke precisa de uma parada de hoje `on_route` (ou `planned`) com dívida para o usuário `driver`.

**Comprovante de entrega (#161):** **Entregar** em uma parada `pending` de um reparto `on_route` abre um assistente de 4 passos (nome do receptor + documento/notas opcionais, tela de assinatura, foto opcional, resumo). Confirmar chama o mesmo `PUT /api/repartos/:id/items/:itemId` com `outcome: delivered`, `receptorNombre` e `firmaBase64` obrigatórios, `fotoBase64` opcional. A compressão do cliente alinha servidor/OpenAPI: assinatura **50 KB**, foto JPEG **200 KB**. Assinatura vazia desabilita confirmar. Erro de upload mantém os dados para nova tentativa. O sucesso atualiza a parada no `RutaContext` e volta à lista. Permissões de câmera e galeria via plugin `expo-image-picker`. Sem mudança Prisma/OpenAPI. O smoke local precisa de um reparto `on_route` de hoje para o usuário `driver` (criar na logística web + **Iniciar**).

**Devoluções na entrega (#163):** **Não consegui entregar** com motivo `rechazo` ou `producto_dañado` (se houver linhas de fatura) abre o formulário (quantidades 0 < qty ≤ linha, notas, foto obrigatória se danificado) e `POST /api/repartos/:id/items/:itemId/devolucion`. Esse POST **não** move estoque nem emite NC. Ausente / endereço errado / outro seguem o `PUT` `not_delivered`. **Prestar devoluções** (`/ruta/rendicion`) lista pendentes e `POST .../devoluciones/rendir`: `StockAjuste` motivo `devolucion_entrega` e NC parcial se houver fatura. Sem fatura: estoque sim, NC não. FEFO + `controlLote` → `422 LOTE_REQUIRED` (fica pendente; não inventar lote). O papel `driver` não recebe `inventory.adjust`. Aplicar migration Prisma `20260819120000_devolucion_entrega_163`. Smoke: parada `on_route` com linhas de fatura; recusa parcial; estoque sem mudança até prestar.

**Modo offline (#164):** com sinal, o login hidrata SQLite (`mi-reparto`, `formas-pago`, `transfer-info`) do dia local (invalida à meia-noite). Modo avião: POD entregue / não entregue, cobranças e registro de devolução vão para outbox FIFO; chips da parada mostram pendente de sync. A fila sobrevive ao fechar o app. Ao reconectar, flush em segundo plano (banner). **A prestação de devoluções continua só online.** Se o servidor já mudou a parada (`422 REPARTO_ITEM_INVALID_STATE` / `REPARTO_INVALID_STATE` / `DEVOLUCION_ALREADY_EXISTS`), o motorista vê conflito e `owner`/`manager`/`logistics_planner` recebem notificação in-app `reparto_sync_conflict`. Sem permissões extras ao `driver`. Sem migration Prisma.

```bash
# Terminal 1 — API
pnpm run server

# Terminal 2 — Expo
pnpm --filter @bizcode/driver start
```

Env opcional:

- `EXPO_PUBLIC_API_BASE_URL` — padrão `http://localhost:3001/api`

Type-check:

```bash
pnpm --filter @bizcode/driver type-check
```

**Smoke manual:** criar ou atribuir usuário com papel `driver` no tenant local (Postgres Docker `:5432`) e um `Reparto` de hoje. Contas seller/manager/owner devem ir para access-denied. Se a rota ainda estiver `planned`, o motorista vê paradas mas não pode marcar não-entrega até um planner iniciar a rota (`POST /api/repartos/:id/iniciar`).

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
| `pnpm --filter @bizcode/driver start` | Expo App Entregador (Expo Go / simulador) |
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
