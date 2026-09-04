# Inventário AFIP/ARCA → módulo fiscal multi-organismo (#378)

| Componente atual | Ação | Componente destino |
|---|---|---|
| `ArcaService` (mock WSAA/WSFE, CAE, TA, config) | reutilizar / envolver | `ArcaFiscalAdapter` + `ArcaService` (único cliente, sem mudanças) |
| `TenantFiscalConfig` | migrar + leitura dual | `FiscalProviderConfig` (`providerCode=arca_wsfe`) |
| `Factura.cae` / `caeVto` / `estadoCae` | manter + auditar | campos legados + `FiscalDocument` |
| `NotaCredito` CAE via `requestCaeForNotaCredito` | encapsular | `FiscalDocumentService.authorizeDocument` |
| `POST /api/arca/*` | alias temporário | delegam para a API fiscal genérica / mesmos serviços |
| UI `ArcaFiscalSection` | generalizar | seção fiscal conforme capacidades do provedor |
| Job `arca:retry-pending` | generalizar | `FiscalDocumentRetryService` (alias CLI) |
| PDF/QR/código de barras AR | envolver | `ArcaFiscalDocumentRenderer` |
| DGI / SII | stubs de capacidades | adapters stub (sem emissão real) |
| SAT/PAC MX | mock homologação | `apps/server/fiscal/mx/` ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)); PAC live não evidenciado |

Consumidores confirmados: `FacturaService`, rotas ARCA, `PadronA4Service` (continua específico de AR), módulo `billing.arca_cae`, faturamento de Pedido (#391), e faturamento via MeLi/TN/Woo.

## Escopo entregue (implementado, #378)

- **Contrato + registro:** interface `FiscalProviderAdapter`, `types.ts` (códigos de provedor `arca_wsfe` / `uruguay_dgi` / `mexico_sat_pac`), `fiscalProviderRegistry.ts`, `bootstrapFiscalProviders.ts` — reflete `EcommerceConnector` / `connectorRegistry.ts`.
- **Adapter ARCA:** `ArcaFiscalAdapter` envolve o `ArcaService` existente — não cria um segundo cliente WSAA/WSFE. `getCapabilities()` reporta `implemented: true`.
- **Stubs de capacidades:** `UruguayDgiFiscalAdapter` / `ChileSiiFiscalAdapter` — `getCapabilities()` reporta `implemented: false`; todo método operacional lança `FiscalAdapterNotImplementedError` (ver [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md)).
- **Mock PAC México:** `MexicoSatFiscalAdapter` em `apps/server/fiscal/mx/` — mock de homologação (`implemented: true`); PAC live não evidenciado ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)).
- **Prisma:** adicionados os modelos `FiscalProviderConfig` e `FiscalDocument`; `TenantFiscalConfig` mantido para leitura dual; script de backfill `scripts/migrate-fiscal-provider-config-378.ts` + script de verificação `scripts/verify-fiscal-provider-migration.ts` (`npm run fiscal:migrate-provider-config`, `npm run fiscal:verify-provider-migration`).
- **Serviços:** `FiscalProviderConfigService` (leitura/escrita dual para `arca_wsfe`), `FiscalDocumentService` (autorização idempotente, uma linha `FiscalDocument` por tentativa), `FiscalDocumentRetryService` (generaliza `ArcaService.retryPending`).
- **Rotas:** `registerFiscalRoutes.ts` (`/api/fiscal/providers/*`, `/api/fiscal/documents/{facturaId}/authorize`); `registerArcaRoutes.ts` refatorado para delegar nos mesmos serviços, com os mesmos paths/formatos de resposta.
- **UI:** `FiscalProviderSection.tsx` lista as capacidades/status de cada provedor registrado e monta `ArcaFiscalSection` sem mudanças para as credenciais de `arca_wsfe`.
- **Renderer:** interface `FiscalDocumentRenderer` + `ArcaFiscalDocumentRenderer` que envolve `buildFacturaPdfImages` (QR/código de barras); `facturaPdf.ts` agora chama o renderer em vez do helper diretamente.

## Não evidenciado no código atual

- Cliente SOAP real da AFIP, cliente real da DGI (Uruguai), cliente comercial SAT/PAC (México) — mocks de homologação evidenciados: ARCA (`arcaWsfeMock.ts`) e CFDI México (`mxSatPacMock.ts`, [ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)).
