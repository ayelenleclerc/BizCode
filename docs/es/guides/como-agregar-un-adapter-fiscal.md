# Cómo agregar un adapter de proveedor fiscal (#378, ADR-0018)

Esta guía sirve para agregar un nuevo proveedor de facturación electrónica (por ejemplo, un cliente real de DGI Uruguay o SAT/PAC México) al módulo fiscal multi-organismo introducido en [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md). Refleja el código tal como está implementado; no describe comportamiento futuro hipotético.

## 1. Agregar el código de proveedor

Agregar el nuevo código a `FISCAL_PROVIDER_CODES` y a `FiscalCountryCode` en [`apps/server/fiscal/types.ts`](../../../apps/server/fiscal/types.ts) si el país es nuevo.

## 2. Implementar `FiscalProviderAdapter`

Crear `apps/server/fiscal/<provider>/<Provider>FiscalAdapter.ts` implementando [`FiscalProviderAdapter`](../../../apps/server/fiscal/FiscalProviderAdapter.ts):

- `validateConfiguration(tenantId)` — verifica que existan credenciales guardadas; nunca devuelve secretos.
- `authenticate(tenantId)` — obtiene/renueva un token de sesión del cliente real del proveedor.
- `authorizeDocument(request)` — solicita la autorización (ej. CFE/CFDI) de una factura o nota de crédito; mapea la respuesta del proveedor a `FiscalAuthorizeResult`.
- `getDocumentStatus(tenantId, documentType, documentId)` — lee el estado actual.
- Opcionales `cancel` / `getLastAuthorizedNumber` / `healthCheck` cuando el proveedor los soporte.
- `getCapabilities()` — debe marcar `implemented: true` **solo cuando el cliente anterior hable con un endpoint real (o un sandbox oficialmente documentado)**; no cambiar este flag para comportamiento mockeado/simulado.

Usar `apps/server/fiscal/arca/ArcaFiscalAdapter.ts` (envuelve `ArcaService`) como implementación de referencia — delega cada llamada en el servicio existente en vez de poner la lógica del proveedor directamente en el adapter.

## 3. Reemplazar el stub de capacidades

Hasta que el paso 2 sea real, el proveedor debe seguir usando su stub bajo `apps/server/fiscal/stubs/` (`UruguayDgiFiscalAdapter.ts`, `MexicoSatFiscalAdapter.ts`), que lanza [`FiscalAdapterNotImplementedError`](../../../apps/server/fiscal/stubs/FiscalAdapterNotImplementedError.ts) en todo método operacional. Una vez que exista el adapter real, actualizar el registro de la factory (paso siguiente) para usarlo en vez del stub — no dejar ambos registrados para el mismo código de proveedor.

## 4. Registrar la factory del adapter

En [`bootstrapFiscalProviders.ts`](../../../apps/server/fiscal/bootstrapFiscalProviders.ts), llamar a `registerFiscalProviderAdapterFactory(provider, (prisma) => new YourFiscalAdapter(prisma))`.

## 5. Prisma / secretos de configuración

Reutilizar `FiscalProviderConfig` (ya genérico): guardar la config del nuevo proveedor con `providerCode = '<provider>'`, `encryptedConfig` como string JSON cifrado con AES-256-GCM (ver `encryptFiscalSecret` / `decryptFiscalSecret` en [`apps/server/fiscal/ar/fiscalSecrets.ts`](../../../apps/server/fiscal/ar/fiscalSecrets.ts)). No agregar columnas de texto plano específicas del proveedor.

## 6. Rutas / UI / OpenAPI

No se necesitan rutas nuevas: `registerFiscalRoutes.ts` y `FiscalProviderSection.tsx` ya son agnósticos de proveedor y leen de `getCapabilities()` / `FiscalProviderConfigService.getStatus()`. Actualizar el enum `FiscalProviderCode` de `docs/api/openapi.yaml` si se agregó un código de proveedor nuevo en el paso 1.

## 7. Tests

Como mínimo, replicar `tests/server/fiscal/arca/arcaFiscalAdapter.test.ts` (tests unitarios del adapter contra un `PrismaClient` mockeado) y remover el caso correspondiente de `tests/server/fiscal/stubs/fiscalStubs.test.ts` una vez que se reemplace el stub. No bajar los umbrales de cobertura de `vitest.config.ts`.

## 8. Documentación

Actualizar la lista de proveedores de esta guía más abajo y agregar una nota en la sección "Consecuencias"/"No evidenciado" de [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md) reflejando la nueva integración real, en los tres idiomas (`docs/en/`, `docs/es/`, `docs/pt-br/`).

## Estado actual de proveedores (evidenciado en el código)

| Proveedor | `providerCode` | `implemented` | Fuente |
|---|---|---|---|
| ARCA / AFIP (Argentina) | `arca_wsfe` | `true` (mock de homologación) | `apps/server/fiscal/arca/ArcaFiscalAdapter.ts` → `apps/server/fiscal/ar/ArcaService.ts` |
| DGI (Uruguay) | `uruguay_dgi` | `false` (stub de capacidades) | `apps/server/fiscal/stubs/UruguayDgiFiscalAdapter.ts` |
| SAT/PAC (México) | `mexico_sat_pac` | `false` (stub de capacidades) | `apps/server/fiscal/stubs/MexicoSatFiscalAdapter.ts` |
