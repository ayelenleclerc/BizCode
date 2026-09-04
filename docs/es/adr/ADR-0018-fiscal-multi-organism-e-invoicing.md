# ADR-0018: Módulo fiscal multi-organismo de facturación electrónica (ARCA como primer adapter)

**Estado:** Aceptada  
**Fecha:** 2026-08-06  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2 (diseño de software); ISO 9001:2015 §8.3.3 (salidas del diseño)

---

## Contexto

BizCode emite CAE mock (AFIP/ARCA Argentina) a través de `ArcaService` (`apps/server/fiscal/ar/ArcaService.ts`, solo mock de homologación — `arcaWsfeMock.ts`), consumido directamente por `FacturaService`, `registerArcaRoutes.ts` y `arca:retry-pending`. La estrategia de producto (issue #378, [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [product-vision-and-deployment.md](../quality/vision-producto-y-despliegue.md)) apunta a otros países/organismos (DGI Uruguay, SAT México vía un PAC) sin duplicar lógica fiscal por jurisdicción fuera de módulos dedicados.

Opciones consideradas:

1. **Mantener ARCA como implementación ad-hoc aislada** y agregar más adelante rutas de código específicas por país — rápido ahora, pero reproduce el anti-patrón de "lógica fiscal duplicada" que ADR-0007 ya descarta.
2. **Extraer un contrato agnóstico de proveedor (patrón adapter), con ARCA como primer y único adapter implementado, y stubs de capacidades para futuros proveedores** — más estructura previa, una única fuente de verdad, replica el patrón `EcommerceConnector` ya usado para integraciones de e-commerce (`apps/server/integrations/ecommerce/`).

## Decisión

1. **Contrato `FiscalProviderAdapter`** (`apps/server/fiscal/FiscalProviderAdapter.ts`): `validateConfiguration`, `authenticate`, `authorizeDocument`, `getDocumentStatus`, opcionales `cancel` / `getLastAuthorizedNumber` / `healthCheck`, y `getCapabilities()`. Códigos de proveedor (`FiscalProviderCode`, `apps/server/fiscal/types.ts`): `arca_wsfe`, `uruguay_dgi`, `mexico_sat_pac`.
2. **Registro + bootstrap** (`fiscalProviderRegistry.ts`, `bootstrapFiscalProviders.ts`) reflejan `connectorRegistry.ts` / `bootstrapEcommerceConnectors.ts`: factories de adapter indexadas por código de proveedor, bootstrap idempotente, helpers de reset solo para tests.
3. **`ArcaFiscalAdapter`** (`apps/server/fiscal/arca/ArcaFiscalAdapter.ts`) envuelve el `ArcaService` existente sin cambios — **no se crea un segundo cliente WSAA/WSFE**; cada llamada delega en el mock de homologación de `ArcaService`. `getCapabilities()` reporta `implemented: true`.
4. **Stubs de solo capacidades** para `uruguay_dgi` (`UruguayDgiFiscalAdapter`) y `mexico_sat_pac` (`MexicoSatFiscalAdapter`): `getCapabilities()` reporta `implemented: false`; todo método operacional lanza `FiscalAdapterNotImplementedError` en vez de inventar comportamiento SOAP/REST que **no está evidenciado en el código actual**.
5. **Prisma:** `FiscalProviderConfig` (config de proveedor por tenant, `@@unique([tenantId, providerCode])`, `encryptedConfig` como bundle JSON cifrado AES-256-GCM) y `FiscalDocument` (una fila auditable por intento de autorización, `@@unique([tenantId, idempotencyKey])`, clave de idempotencia `{provider}:{factura|nota_credito}:{id}`). La tabla legada `TenantFiscalConfig` se **conserva** para lectura dual; un script de backfill (`scripts/migrate-fiscal-provider-config-378.ts`) completa `FiscalProviderConfig` para los tenants con configuración `arca_wsfe` existente, verificado por `scripts/verify-fiscal-provider-migration.ts`.
6. **Servicios:** `FiscalProviderConfigService` (lectura/escritura dual entre `TenantFiscalConfig` y `FiscalProviderConfig` para `arca_wsfe`, listado de capacidades, resolución del proveedor por defecto), `FiscalDocumentService` (orquestación idempotente de autorización, resuelve el adapter y persiste un intento `FiscalDocument`), `FiscalDocumentRetryService` (generaliza `ArcaService.retryPending` a través de `FiscalDocumentService`). `FacturaService` ahora llama a `FiscalDocumentService.authorizeInvoice` / `authorizeCreditNote` en vez de `ArcaService` directamente (el flag `skipArcaCae` conserva su nombre por compatibilidad).
7. **Rutas:** `registerFiscalRoutes.ts` expone el contrato agnóstico de proveedor (`GET`/`PUT /api/fiscal/providers/config`, `POST /api/fiscal/providers/validate`, `GET /api/fiscal/providers/capabilities`, `POST /api/fiscal/documents/{facturaId}/authorize`). `registerArcaRoutes.ts` se refactoriza para **delegar** en los mismos servicios (`FiscalProviderConfigService`, `ArcaFiscalAdapter`, `FiscalDocumentService`) manteniendo los mismos paths y formas de respuesta de `/api/arca/*` por compatibilidad; el `padron` específico de AR queda fuera del contrato fiscal genérico.
8. **Abstracción de renderer:** interfaz `FiscalDocumentRenderer<T>` + `ArcaFiscalDocumentRenderer` que envuelve el `buildFacturaPdfImages` existente (QR/código de barras); `facturaPdf.ts` llama al renderer en vez del helper directamente, sin mover el resto del layout PDF específico de AR.
9. **UI:** `FiscalProviderSection.tsx` lista las capacidades y el estado por tenant de cada proveedor registrado (con el mismo flag de módulo `billing.arca_cae`) y monta debajo `ArcaFiscalSection` sin cambios para las credenciales de `arca_wsfe`, ya que es el único proveedor con adapter funcional hoy.

## Consecuencias

- **Positivo:** ARCA se comporta como un adapter intercambiable en vez de una implementación paralela y hardcodeada; agregar un cliente real de DGI/SAT en el futuro implica implementar `FiscalProviderAdapter` y registrar una factory, sin tocar `FacturaService`, rutas ni el wiring de UI; los stubs de capacidades permiten que UI y rutas degraden con claridad (`implemented: false`, HTTP 501) en vez de fallar en silencio o inventar datos; los consumidores y tests existentes de `/api/arca/*` (`tests/api/arca.test.ts`) siguen funcionando sin cambios.
- **Negativo:** una capa extra de indirección (`FiscalDocumentService` → adapter → `ArcaService`) por cada solicitud de CAE; dos fuentes de configuración (`TenantFiscalConfig` y `FiscalProviderConfig`) deben mantenerse consistentes hasta que todos los tenants estén migrados y la tabla legada se deprecie en un ADR futuro.
- **No evidenciado en el código actual:** cliente SOAP real de AFIP, cliente real de DGI (Uruguay), cliente real de SAT/PAC (México). Solo está evidenciado el mock de homologación de ARCA (`arcaWsfeMock.ts`); los stubs no deben tratarse como integraciones funcionales.
- **Seguimiento:** se requiere un ADR futuro antes de eliminar `TenantFiscalConfig` (lectura dual) o antes de implementar un adapter live de `uruguay_dgi`. El mock PAC de México está en [ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md); PAC comercial live sigue sin evidenciarse.

## Referencias

- Issue #378
- [ADR-0007: Despliegue dual y modularidad fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [Inventario fiscal multi-organismo (#378)](../quality/inventario-fiscal-multi-organismo-378.md)
- [Cómo agregar un adapter de proveedor fiscal](../guides/como-agregar-un-adapter-fiscal.md)
- [vision-producto-y-despliegue.md](../quality/vision-producto-y-despliegue.md) (PROD-VISION-001)
