# Guía de entorno local de desarrollo

Onboarding para contribuidores: PostgreSQL, migraciones, seed y API + Vite en local. Paridad con CI/pruebas: [paridad-entornos-pruebas.md](paridad-entornos-pruebas.md).

## Estructura del monorepo

BizCode usa **pnpm workspaces** y **Turborepo** (#154):

| Ruta | Rol |
|------|-----|
| `apps/web/` | Frontend React + Vite |
| `apps/server/` | API Express |
| `apps/seller/` | Expo (React Native) App Vendedor — ventas en campo (#167–#172) |
| `apps/driver/` | Expo (React Native) App Repartidor — entregas (#159–#166) |

| `packages/types/` | Tipos TypeScript y contratos RBAC compartidos |
| `packages/api-client/` | Cliente HTTP de la API |
| `prisma/` | Esquema y migraciones (raíz del repo) |
| `tests/`, `e2e/` | Suites de prueba compartidas (raíz) |

Instale y ejecute comandos desde la **raíz del repositorio**.

### Cliente API (`@bizcode/api-client`)

El cliente HTTP compartido está en `packages/api-client/`. Ya no lee variables de Vite directamente (preparado para React Native): `apps/web` invoca `initApiClientFromEnv()` desde `apps/web/src/lib/api-config.ts` en `main.tsx` antes del render, vinculando `VITE_API_URL` con `configureApiClients()`. URL base por defecto si no está definida: `http://localhost:3001/api`. Las APIs por dominio están en `packages/api-client/src/modules/`; `createApiClient()` / `createPortalApiClient()` aceptan base URL opcional para otros hosts.

Opcional en `.env` para la app web:

- `VITE_API_URL` — base completa de la API incluyendo `/api` (p. ej. `http://localhost:3001/api`)

### App Vendedor (`apps/seller`, #167–#172)

App Expo SDK con Expo Router. La UI usa React Native Paper (`@bizcode/ui` queda diferido a #157). Auth en modo **Bearer dual**: la API sigue seteando cookies HttpOnly para web y además devuelve `accessToken` / `refreshToken` / `expiresIn` en el body de login y refresh. La app seller guarda esos tokens en **expo-secure-store** (nunca AsyncStorage) y envía `Authorization: Bearer` más `x-bizcode-channel: field`.

Roles permitidos: `seller`, `manager`, `owner`. Otros roles ven una pantalla accesible de denegación “solo vendedor”.

**Clientes (#168):** búsqueda online (`GET /api/clientes?q=`) y ficha con pestañas Cuenta / Pedidos / Datos (saldo vía `GET …/cuenta-corriente/saldo` si `finance.ledger` está habilitado, facturas vencidas vía `GET …/facturas-pendientes` si `finance.receipts` está habilitado, últimos pedidos, contacto + dialer nativo, score y zona). Roles con `customers.read` pueden llamar esos dos GET (el ledger completo / escritura de recibos sigue exigiendo `reports.financial.read`). Cache offline → **#171**.

**Toma de pedidos (#169):** desde la ficha, **Nuevo pedido** abre `/pedidos/nuevo?clienteId=` con catálogo online (`GET /api/articulos`, rubros), carrito en memoria, resumen (descuento por línea, `condicionCobro` / `plazoDias`, `observaciones` para depósito), luego `POST /api/pedidos` + `POST …/confirm`. Stock y crédito excedido son solo avisos. Cola offline / cache de catálogo → **#171**.

**Agenda / Mi Ruta Hoy (#170 + #267):** pestaña `/agenda` es **Mi Ruta Hoy**: `GET/POST /api/rutas`, reordenar/reemplazar paradas, `PATCH` estado (`visitado` → `/(app)/pedidos/nuevo?clienteId=` y crea/actualiza `VisitaVendedor`; `postergado` → próximo día sin `Feriado`; `no_visitado` + motivo). Banner de feriado vía `GET /api/feriados?fecha=`. Pines de mapa (`react-native-maps`) solo si hay `Cliente.latitud`/`longitud` (sin geocoder). Outbox offline ampliada a mutaciones de ruta. Managers ven progreso en web `/visitas` (`GET /api/rutas/:id/stats`, polling 60s) y asignan `VendedorZona`. Seed feriados AR: `npm run feriados:seed-ar`.

**Modo offline (#171):** tras login (online), hydrate del día a `expo-sqlite` (clientes, artículos, rubros, agenda/ruta, feriados del día, pedidos recientes) con metadatos MMKV (`cacheDay`; fallback en memoria si MMKV nativo no está). Sin señal, listas/ficha/catálogo/ruta/confirmación de pedido leen SQLite y encolan escrituras (pedidos + visitas + rutas) en outbox FIFO vaciada por NetInfo al reconectar. Banner con fecha offline y pendientes. Invalidación al cambiar el día local. Objetivo principal nativo Expo; el mapa puede requerir development build.

**Notificaciones push (#172):** tras autenticarse la app pide permiso, obtiene el token Expo y lo registra con `POST /api/users/me/push-token` (se borra al logout). El backend envía Expo Push en confirm/cancel de pedido (al `vendedorId`), alertas de crédito / pagos de cliente (sellers por `VendedorZona` + pedidos recientes) y chat. La pestaña Perfil `/perfil` silencia tipos con `GET/PUT /api/users/me/push-preferences`. El tap abre pedido o cliente. Infra compartida para App Driver (#165). Entrega física requiere build nativo; CI cubre API + unit tests del sender.

**Sugerencias modo check (#254):** `GET /api/clientes/:id/sugerencias-pedido` devuelve habituales (ranking por frecuencia a 6 meses, qty sugerida, chip de anomalía) y `ArticuloOferta` activas que no estén ya en habituales. En `/pedidos/nuevo` sin búsqueda, las secciones aparecen sobre el catálogo; el primer add usa la qty sugerida; los topes de stock reusan #256. El hydrate offline cachea sugerencias en SQLite.

**Escáner de barras (#255):** cargar `Articulo.codigoBarras` en la ficha web. En `/pedidos/nuevo`, **Escanear código** abre `/pedidos/escanear` (`expo-camera`). Lookup: SQLite local primero, luego `GET /api/articulos?codigoBarras=`. Aplicar migración Prisma `20260812180000_articulo_codigo_barras_255` en Postgres Docker `:5432`.

**Numpad nativo + descuento rápido (#264):** tap en la cantidad (catálogo / sugerencias / resumen / escáner) abre `NumpadSheet` (sin teclado del sistema). El separador decimal sigue el locale i18n del seller (`,` ES/pt-BR, `.` EN). En resumen, swipe → **% Desc** / **Eliminar**; el footer **Descuento a todas las líneas** aplica el mismo `dscto` (0–100) a todo el carrito. Se persiste el `PedidoItem.dscto` existente (sin API nueva). Los topes de stock #256 siguen aplicando.

**Confirmación WhatsApp (#265):** tras confirmar, success + detalle muestran **Enviar por WhatsApp**. Modo link abre `wa.me/{Cliente.telef}` (solo dígitos; no hay `celular`). Twilio exige módulo `comms.whatsapp` y `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (ver `.env.example`). Preview `GET /api/pedidos/{id}/whatsapp-share`; envío/auditoría `POST /api/pedidos/{id}/whatsapp` `{ canal: link|twilio }` escribe `AuditEvent` `whatsapp_enviado` (no existe `PedidoEvento`). Plantilla opcional `TenantConfig.sellerWhatsappTemplate` en seller-policies (sin UI web nueva). Mensaje ≤1024. Pedidos offline (`id < 0`) pueden abrir wa.me con snapshot local; Twilio deshabilitado. Aplicar migración Prisma `20260813120000_seller_whatsapp_template_265` contra Postgres Docker `:5432`.

**Pedido por voz (#266, [ADR-0020](../adr/ADR-0020-seller-speech-to-order.md)):** en `/pedidos/nuevo`, **Dictar pedido**. Online: `POST /api/voice/transcribe` (Whisper, `OPENAI_API_KEY` solo en el **server**). Offline o 503/timeout: STT on-device (`expo-speech-recognition`; build EAS nativo, no Expo Go). Parser + fuzzy top-3 en el dispositivo; **nada** al carrito hasta confirmar/descartar. Unidades → `Articulo.unidadBase` (no existe `unidadMedida`). Ruido de almacén: prueba **manual**. Sin migración Prisma.

**Catálogo visual con grilla (#257):** `GET /api/articulos` y `GET /api/articulos/{id}` incluyen `urlThumb` opcional (`/uploads/articulos/...`, imagen principal de #235; `products.read`; sin módulo `catalog.variants`, sin CDN/S3, sin migración Prisma). En `/pedidos/nuevo`, toggle lista/grilla (MMKV `seller.catalogView`); la grilla usa `FlashList` (2 columnas, 3 en pantallas anchas) con `expo-image`, grayscale + badge sin stock, badge de oferta de #254, headers de rubro cuando el chip es “todos”. Tap abre `NumpadSheet` (#264); tap largo muestra campos existentes (descripcion, codigo, precio, stock). El hydrate offline precarga thumbs con `expo-file-system`; la búsqueda local (`LIMIT 500`) corre primero con 2+ caracteres. La navegación de familia sigue siendo chips de **Rubro** (árbol `CategoriaArticulo` fuera de alcance). Se mantiene el filtro `!esPadre`; sin selector padre+hijos. El tab `/catalogo` sigue stub.

**Repetir último pedido y plantillas (#253):** CTA en ficha `GET /api/clientes/:id/ultimo-pedido-repeat` precarga el carrito (`CartContext.replaceLines`) con precios de lista actuales; omite inactivos/padre/faltantes/servicio (banner en `/pedidos/nuevo`). Plantillas: `GET|POST /api/clientes/:id/plantillas-pedido` y `GET|PATCH|DELETE /api/plantillas-pedido/:id` más `GET …/cargar`. El hydrate offline cachea plantillas y el último pedido en SQLite. UI web manager fuera de alcance.

**Alertas de deuda/stock (#256):** políticas Seller en `TenantConfig` (defaults: sobre límite `block`, vencida `warn`, stock cero `warn`, tope de cantidad al stock). El Seller lee `GET /api/tenant-config/seller-policies` (`orders.create`); owner/manager patch con `settings.business.manage` o `users.manage`. La ficha abre diálogo desde `GET /api/clientes/:id/estado-credito` (niveles `ok`/`amarillo`/`naranja`/`rojo`). El carrito usa `GET /api/articulos/stock-multiple?ids=` para colores y tope; el resumen puede bloquear confirm. El hydrate offline cachea crédito/stock/políticas con banner `asOf`. Sin cobros in-app ni aprobación manager.

Cadenas de UI con **i18next** (EN / ES / pt-BR) y `expo-localization` para el idioma del dispositivo.

```bash
# Terminal 1 — API
pnpm run server

# Terminal 2 — Expo
pnpm --filter @bizcode/seller start
```

Env opcional (Expo public):

- `EXPO_PUBLIC_API_BASE_URL` — por defecto `http://localhost:3001/api`

Type-check:

```bash
pnpm --filter @bizcode/seller type-check
```

**CORS / Expo web:** los orígenes por defecto incluyen Vite (`5173`/`4173`) y Expo web (`8081`, `19006`). Para un dispositivo u origen custom, seteá `CORS_ORIGINS` (separado por comas) en `.env`. Expo Go nativo / development builds normalmente no envían header `Origin` de navegador.

**Dispositivo físico:** apuntá `EXPO_PUBLIC_API_BASE_URL` a la IP LAN de la máquina (p. ej. `http://192.168.x.x:3001/api`), no a `localhost`.

### Build EAS y OTA (#173)

Workflow Expo managed (`apps/seller`). `android/` / `ios/` nativos siguen en gitignore. **No** hay `projectId` Expo commiteado.

Operador (una vez):

1. Desde `apps/seller`, `eas init` con una cuenta Expo (escribe el UUID real).
2. Guardar secrets de GitHub `EXPO_TOKEN` y `EAS_PROJECT_ID` (comentarios en `.env.example`). Secret opcional `EXPO_PUBLIC_API_BASE_URL` se embebe en el build nativo.
3. **No** commitear el UUID; `app.config.ts` setea `extra.eas.projectId` y `updates.url` solo si existe `EAS_PROJECT_ID`. Push (#172) ya lee ese extra.

Perfiles en `apps/seller/eas.json`:

| Perfil | Android | iOS | Distribución |
|---|---|---|---|
| `production` | AAB (`app-bundle`) | IPA (`simulator: false`) | `store` |
| `internal` | APK | IPA | `internal` |

OTA: `expo-updates` con `runtimeVersion.policy: appVersion` (versión `0.1.0`). CI ejecuta `eas update --channel production` en tag `seller-v*`. Este cambio **no** mide la latencia OTA en un dispositivo.

Wrappers locales (`EXPO_TOKEN` / login Expo; `eas-cli@16` vía `pnpm dlx`):

```bash
pnpm --filter @bizcode/seller eas:build:production
pnpm --filter @bizcode/seller eas:build:internal
pnpm --filter @bizcode/seller eas:update
```

El primer upload a Play Console / App Store y Apple Developer / `eas submit` son **manuales**. Quality Gate **no** ejecuta EAS.

### Copy de ficha Google Play (#173)

Reutilizar ícono y splash de `apps/seller/assets/`. **No** hay screenshots de store en el repo.

URL de privacidad: `{PUBLIC_WEB_ORIGIN}/privacidad` (página pública #195; el operador indica el origen desplegado).

**EN — short:** Field sales for BizCode: customers, orders, catalog, and daily route.

**EN — full:** BizCode Seller is the field-sales app for the BizCode ERP. Sellers sign in with their company account, look up customers, take orders (catalog, scanner, suggestions), confirm visits on the daily route, and work offline with later sync. Push notifications and WhatsApp confirmation use the company BizCode server. This listing does not collect store screenshots in the repository; use device captures from a signed build.

**ES — corta:** Ventas de campo para BizCode: clientes, pedidos, catálogo y ruta del día.

**ES — completa:** BizCode Seller es la app de vendedor de campo del ERP BizCode. El vendedor inicia sesión con la cuenta de la empresa, consulta clientes, toma pedidos (catálogo, escáner, sugerencias), confirma visitas en la ruta del día y trabaja sin conexión con sincronización posterior. Las notificaciones push y la confirmación por WhatsApp usan el servidor BizCode de la empresa. No hay capturas de Play Store en el repositorio; usar capturas de un build firmado.

**Nota:** `@bizcode/ui` (#157) está fuera de alcance de #167/#168; no bloquear type-check ni login por ese paquete.

### App Repartidor (`apps/driver`, #159–#162)

App Expo SDK con Expo Router (mismo stack que Seller). Auth en modo **Bearer dual** con tokens en **expo-secure-store** y `Authorization: Bearer` más `x-bizcode-channel: field`.

Rol permitido: solo **`driver`**. Otros roles ven pantalla de acceso denegado.

**Ruta del día (#160):** la pestaña `/ruta` carga `GET /api/repartos/mi-reparto` (`orders.deliver.confirm` + módulo `logistics.dispatches`; `choferId` es siempre el usuario autenticado). Prefiere el reparto `on_route` de hoy; si no, el `planned` más reciente. La lista muestra secuencia, cliente, domicilio, cantidad de artículos, chips de estado y badge de deuda. El detalle abre mapas con `Linking` (sin API key de Google Static) y `tel:` para `Cliente.telef`. **No pude entregar** llama el `PUT /api/repartos/:id/items/:itemId` existente con `not_delivered` + motivo (la ruta debe estar `on_route`). **Cobrar** en una parada con deuda abre `/cobros?clienteId=`. Sin migración Prisma. `GET /api/repartos/:id` también permite al chofer asignado.

**Cobros en entrega (#162):** la pestaña `/cobros` sin `clienteId` queda vacía (ir a Ruta). Con un `clienteId` de `mi-reparto` de hoy, el formulario muestra `rsocial` + saldo, checkboxes de facturas (solo arman el monto default; `POST /api/cobros` no imputa ReciboCobro), importe editable, formas de `GET /api/formas-pago`, CBU/alias de `GET /api/cobros/transfer-info` (o mensaje i18n si no hay cuenta), campos de cheque como `CobroForm` web y observaciones. Si el importe supera el saldo, hay diálogo de confirmación. El éxito recarga el snapshot de ruta y ofrece recibo WhatsApp editable (`Linking` a `wa.me/{Cliente.telef}` solo dígitos) más `Share` nativo del mismo texto — sin Twilio y sin PDF. Diferido: rendición de efectivo, `origenApp` / `repartoId`, PDF de servidor. El QR Mercado Pago en App Driver sigue fuera de alcance. El smoke necesita una parada de hoy `on_route` (o `planned`) con deuda para el usuario `driver`.

**Comprobante de entrega (#161):** **Entregar** en una parada `pending` de un reparto `on_route` abre un wizard de 4 pasos (nombre del receptor + DNI/notas opcionales, lienzo de firma, foto opcional, resumen). Confirmar llama el mismo `PUT /api/repartos/:id/items/:itemId` con `outcome: delivered`, `receptorNombre` y `firmaBase64` obligatorios, `fotoBase64` opcional. La compresión del cliente alinea servidor/OpenAPI: firma **50 KB**, foto JPEG **200 KB**. Firma vacía deshabilita confirmar. Un error de subida conserva los datos para reintentar. El éxito actualiza la parada en `RutaContext` y vuelve a la lista. Permisos de cámara y galería vía plugin `expo-image-picker`. Sin cambio Prisma/OpenAPI. El smoke local necesita un reparto `on_route` de hoy para el usuario `driver` (crearlo en logística web + **Iniciar**).

```bash
# Terminal 1 — API
pnpm run server

# Terminal 2 — Expo
pnpm --filter @bizcode/driver start
```

Env opcional:

- `EXPO_PUBLIC_API_BASE_URL` — por defecto `http://localhost:3001/api`

Type-check:

```bash
pnpm --filter @bizcode/driver type-check
```

**Smoke manual:** crear o asignar un usuario con rol `driver` en el tenant local (Postgres Docker `:5432`) y un `Reparto` de hoy. Cuentas seller/manager/owner deben caer en access-denied. Si la ruta sigue `planned`, el chofer ve paradas pero no puede marcar no-entrega hasta que un planner inicie la ruta (`POST /api/repartos/:id/iniciar`).

## Requisitos

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **pnpm** 10.x (`packageManager` en la raíz; `corepack enable`)
- **Rust** ≥ 1.77 (stable) para builds Tauri
- **PostgreSQL** 15 o 16, o **Docker** con el compose del repositorio

## Clonado e instalación

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
corepack enable
pnpm install --frozen-lockfile
```

### Notas Windows (pnpm)

Si `pnpm install` falla con `EPERM` / `ENOENT` al renombrar paquetes bajo `node_modules`, use el helper de Windows (reintentos + exclusiones opcionales de **rutas** de Defender solo para este repo y el store de pnpm; **no** desactiva la protección en tiempo real):

```bat
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1 -FrozenLockfile
```

La configuración del editor excluye `node_modules` del file watcher (`.vscode/settings.json`). Prefiera hardlinks frente a `package-import-method=copy` (véase `.npmrc` en la raíz y [CONTRIBUTING.md](../../../CONTRIBUTING.md)).

## Variables de entorno

Copie [`.env.example`](../../../.env.example) a `.env` y configure al menos:

- `DATABASE_URL`
- `JWT_SECRET` (obligatorio fuera de tests; ver `apps/server/config/env.ts`)
- `BIZCODE_SEED_SUPERADMIN_PASSWORD` (≥ 8 caracteres antes de `npx prisma db seed`)

El resto de variables opcionales están en `.env.example`.

## PostgreSQL

**Docker (recomendado):**

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Ajuste `DATABASE_URL` al puerto publicado en `docker-compose.postgres.yml`.

**Instalación nativa:** cree una base vacía y configure `DATABASE_URL`.

## Esquema y seed

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`pnpm run seed` ejecuta `prisma/seed.ts` vía `tsx`. Tras el seed: tenant `platform`, usuario `ayelen`, contraseña según `BIZCODE_SEED_SUPERADMIN_PASSWORD` ([README.md](../../../README.md)).

## Ejecución

| Comando | Uso |
|---------|-----|
| `pnpm run dev:full` | API sidecar + Vite |
| `pnpm run server` | Solo API (`http://localhost:3001`) |
| `pnpm run dev:vite` | Solo Vite (`http://localhost:5173`) |
| `pnpm --filter @bizcode/seller start` | Expo App Vendedor (Expo Go / simulador) |
| `pnpm --filter @bizcode/driver start` | Expo App Repartidor (Expo Go / simulador) |
| `pnpm run dev` | Tauri (requiere Rust) |

Swagger UI con API en marcha: `http://localhost:3001/api-docs/`.

## Puerta de calidad (local)

```bash
pnpm run type-check
pnpm run test
pnpm run test:coverage
pnpm run test:integration
pnpm run test:e2e
```

## Resolución de problemas

- **Login sin conexión al servidor:** API en 3001 (`pnpm run server` o `pnpm run dev:full`); revise `POST /api/auth/login` en red.
- **Puertos en conflicto:** el puerto por defecto documentado del API es 3001.
- **Errores de BD:** `DATABASE_URL`, servicio PostgreSQL y `npx prisma migrate dev`.
- **Fallos de build Tauri:** toolchain Rust stable y dependencias de Tauri 1.5.
- **PowerShell:** Command Prompt, Git Bash o `pnpm.cmd` ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).
