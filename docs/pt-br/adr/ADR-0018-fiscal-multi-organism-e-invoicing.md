# ADR-0018: Módulo fiscal multi-organismo de nota fiscal eletrônica (ARCA como primeiro adapter)

**Status:** Aceita  
**Data:** 2026-08-06  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2 (design de software); ISO 9001:2015 §8.3.3 (saídas de design)

---

## Contexto

O BizCode emite CAE mock (AFIP/ARCA Argentina) através de `ArcaService` (`apps/server/fiscal/ar/ArcaService.ts`, apenas mock de homologação — `arcaWsfeMock.ts`), consumido diretamente por `FacturaService`, `registerArcaRoutes.ts` e `arca:retry-pending`. A estratégia de produto (issue #378, [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [visao-produto-e-implantacao.md](../quality/visao-produto-e-implantacao.md)) visa outros países/organismos (DGI Uruguai, SAT México via um PAC) sem duplicar lógica fiscal por jurisdição fora de módulos dedicados.

Opções consideradas:

1. **Manter ARCA como implementação isolada ad-hoc** e acrescentar depois caminhos de código específicos por país — rápido agora, mas reproduz o antipadrão de "lógica fiscal duplicada" que o ADR-0007 já descarta.
2. **Extrair um contrato agnóstico de provedor (padrão adapter), com ARCA como primeiro e único adapter implementado, e stubs de capacidades para futuros provedores** — mais estrutura prévia, uma única fonte de verdade, reflete o padrão `EcommerceConnector` já usado nas integrações de e-commerce (`apps/server/integrations/ecommerce/`).

## Decisão

1. **Contrato `FiscalProviderAdapter`** (`apps/server/fiscal/FiscalProviderAdapter.ts`): `validateConfiguration`, `authenticate`, `authorizeDocument`, `getDocumentStatus`, opcionais `cancel` / `getLastAuthorizedNumber` / `healthCheck`, e `getCapabilities()`. Códigos de provedor (`FiscalProviderCode`, `apps/server/fiscal/types.ts`): `arca_wsfe`, `uruguay_dgi`, `chile_sii`, `mexico_sat_pac`.
2. **Registro + bootstrap** (`fiscalProviderRegistry.ts`, `bootstrapFiscalProviders.ts`) refletem `connectorRegistry.ts` / `bootstrapEcommerceConnectors.ts`: factories de adapter indexadas por código de provedor, bootstrap idempotente, helpers de reset apenas para testes.
3. **`ArcaFiscalAdapter`** (`apps/server/fiscal/arca/ArcaFiscalAdapter.ts`) envolve o `ArcaService` existente sem mudanças — **não é criado um segundo cliente WSAA/WSFE**; cada chamada delega ao mock de homologação do `ArcaService`. `getCapabilities()` reporta `implemented: true`.
4. **Mocks de homologação** para `uruguay_dgi` ([ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md)), `chile_sii` ([ADR-0026](ADR-0026-chile-sii-dte-mock.md)) e `mexico_sat_pac` ([ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md)): `getCapabilities()` reporta `implemented: true`; DGI/SII/PAC live SOAP/REST/XML permanece **não evidenciado**.
5. **Prisma:** `FiscalProviderConfig` (config de provedor por tenant, `@@unique([tenantId, providerCode])`, `encryptedConfig` como pacote JSON criptografado AES-256-GCM) e `FiscalDocument` (uma linha auditável por tentativa de autorização, `@@unique([tenantId, idempotencyKey])`, chave de idempotência `{provider}:{factura|nota_credito}:{id}`). A tabela legada `TenantFiscalConfig` é **mantida** para leitura dual; um script de backfill (`scripts/migrate-fiscal-provider-config-378.ts`) preenche `FiscalProviderConfig` para tenants com configuração `arca_wsfe` existente, verificado por `scripts/verify-fiscal-provider-migration.ts`.
6. **Serviços:** `FiscalProviderConfigService` (leitura/escrita dual entre `TenantFiscalConfig` e `FiscalProviderConfig` para `arca_wsfe`, listagem de capacidades, resolução do provedor padrão), `FiscalDocumentService` (orquestração idempotente de autorização, resolve o adapter e persiste uma tentativa `FiscalDocument`), `FiscalDocumentRetryService` (generaliza `ArcaService.retryPending` através de `FiscalDocumentService`). `FacturaService` agora chama `FiscalDocumentService.authorizeInvoice` / `authorizeCreditNote` em vez de `ArcaService` diretamente (o flag `skipArcaCae` mantém o nome por compatibilidade).
7. **Rotas:** `registerFiscalRoutes.ts` expõe o contrato agnóstico de provedor (`GET`/`PUT /api/fiscal/providers/config`, `POST /api/fiscal/providers/validate`, `GET /api/fiscal/providers/capabilities`, `POST /api/fiscal/documents/{facturaId}/authorize`). `registerArcaRoutes.ts` é refatorado para **delegar** nos mesmos serviços (`FiscalProviderConfigService`, `ArcaFiscalAdapter`, `FiscalDocumentService`) mantendo os mesmos paths e formatos de resposta de `/api/arca/*` por compatibilidade; o `padron` específico de AR permanece fora do contrato fiscal genérico.
8. **Abstração de renderer:** interface `FiscalDocumentRenderer<T>` + `ArcaFiscalDocumentRenderer` que envolve o `buildFacturaPdfImages` existente (QR/código de barras); `facturaPdf.ts` chama o renderer em vez do helper diretamente, sem mover o restante do layout PDF específico de AR.
9. **UI:** `FiscalProviderSection.tsx` lista as capacidades e o status por tenant de cada provedor registrado (gating de módulo por jurisdição) e monta seções de credenciais/config por provedor (p. ex. `ArcaFiscalSection` para `arca_wsfe`; seções UY/CL/MX para seus mocks). Os mocks de homologação reportam `implemented: true`; clientes live DGI/SII/PAC permanecem Not evidenced.

## Consequências

- **Positivo:** ARCA se comporta como um adapter intercambiável em vez de uma implementação paralela e fixa; adicionar um cliente real de DGI/SAT no futuro implica implementar `FiscalProviderAdapter` e registrar uma factory, sem tocar em `FacturaService`, rotas ou o wiring de UI; os stubs de capacidades permitem que UI e rotas degradem com clareza (`implemented: false`, HTTP 501) em vez de falhar silenciosamente ou inventar dados; os consumidores e testes existentes de `/api/arca/*` (`tests/api/arca.test.ts`) continuam funcionando sem mudanças.
- **Negativo:** uma camada extra de indireção (`FiscalDocumentService` → adapter → `ArcaService`) por cada solicitação de CAE; duas fontes de configuração (`TenantFiscalConfig` e `FiscalProviderConfig`) precisam permanecer consistentes até que todos os tenants estejam migrados e a tabela legada seja descontinuada em um ADR futuro.
- **Não evidenciado no código atual:** cliente SOAP real da AFIP, cliente live DGI (Uruguai), cliente live SII (Chile), cliente live SAT/PAC (México). Os **mocks** de homologação estão evidenciados para `arca_wsfe`, `uruguay_dgi`, `chile_sii` e `mexico_sat_pac` (`implemented: true` no registro de provedores fiscais). Brasil / NF-e **não** está registrado. Os mocks não devem ser tratados como integrações live com o organismo.
- **Acompanhamento:** um ADR futuro é necessário antes de remover `TenantFiscalConfig` (leitura dual) ou antes de implementar clientes live DGI/SII/PAC. Mock CFE Uruguai: [ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md); mock DTE Chile: [ADR-0026](ADR-0026-chile-sii-dte-mock.md); mock PAC México: [ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md); PAC / DGI / SII live permanecem não evidenciados.

## Referências

- Issue #378
- [ADR-0007: Implantação dual e modularidade fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [Inventário fiscal multi-organismo (#378)](../quality/inventario-fiscal-multi-organismo-378.md)
- [Como adicionar um adapter de provedor fiscal](../guides/como-adicionar-um-adapter-fiscal.md)
- [visao-produto-e-implantacao.md](../quality/visao-produto-e-implantacao.md) (PROD-VISION-001)

## Revisão

| Versão | Data | Resumo |
|--------|------|--------|
| 1.0 | 2026-08-06 | Aceito com #378 |
| 1.1 | 2026-11-11 | Códigos de provedor + consequências: `chile_sii`; mocks UY/CL/MX vs live (higiene #210) |
