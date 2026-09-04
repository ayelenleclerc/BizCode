# Como adicionar um adapter de provedor fiscal (#378, ADR-0018)

Este guia serve para adicionar um novo provedor de nota fiscal eletrônica (por exemplo, um cliente real da DGI Uruguai ou SAT/PAC México) ao módulo fiscal multi-organismo introduzido na [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md). Reflete o código como implementado; não descreve comportamento futuro hipotético.

## 1. Adicionar o código de provedor

Adicionar o novo código em `FISCAL_PROVIDER_CODES` e em `FiscalCountryCode` em [`apps/server/fiscal/types.ts`](../../../apps/server/fiscal/types.ts) se o país for novo.

## 2. Implementar `FiscalProviderAdapter`

Criar `apps/server/fiscal/<provider>/<Provider>FiscalAdapter.ts` implementando [`FiscalProviderAdapter`](../../../apps/server/fiscal/FiscalProviderAdapter.ts):

- `validateConfiguration(tenantId)` — verifica se existem credenciais armazenadas; nunca retorna segredos.
- `authenticate(tenantId)` — obtém/renova um token de sessão do cliente real do provedor.
- `authorizeDocument(request)` — solicita a autorização (ex. CFE/CFDI) de uma fatura ou nota de crédito; mapeia a resposta do provedor para `FiscalAuthorizeResult`.
- `getDocumentStatus(tenantId, documentType, documentId)` — lê o status atual.
- Opcionais `cancel` / `getLastAuthorizedNumber` / `healthCheck` quando o provedor os suportar.
- `getCapabilities()` — deve marcar `implemented: true` **apenas quando o cliente acima falar com um endpoint real (ou um sandbox oficialmente documentado)**; não altere essa flag para comportamento mockado/simulado.

Usar `apps/server/fiscal/arca/ArcaFiscalAdapter.ts` (envolve `ArcaService`) como implementação de referência — delega cada chamada ao serviço existente em vez de colocar a lógica do provedor diretamente no adapter.

## 3. Substituir o stub de capacidades

Até que o passo 2 seja real, o provedor deve continuar usando seu stub em `apps/server/fiscal/stubs/` (p. ex. `UruguayDgiFiscalAdapter.ts`, `ChileSiiFiscalAdapter.ts`), que lança [`FiscalAdapterNotImplementedError`](../../../apps/server/fiscal/stubs/FiscalAdapterNotImplementedError.ts) em todo método operacional. Depois que o adapter real existir, atualizar o registro da factory (passo seguinte) para usá-lo em vez do stub — não deixar os dois registrados para o mesmo código de provedor.

## 4. Registrar a factory do adapter

Em [`bootstrapFiscalProviders.ts`](../../../apps/server/fiscal/bootstrapFiscalProviders.ts), chamar `registerFiscalProviderAdapterFactory(provider, (prisma) => new YourFiscalAdapter(prisma))`.

## 5. Prisma / segredos de configuração

Reutilizar `FiscalProviderConfig` (já genérico): armazenar a config do novo provedor com `providerCode = '<provider>'`, `encryptedConfig` como string JSON criptografada com AES-256-GCM (ver `encryptFiscalSecret` / `decryptFiscalSecret` em [`apps/server/fiscal/ar/fiscalSecrets.ts`](../../../apps/server/fiscal/ar/fiscalSecrets.ts)). Não adicionar colunas de texto plano específicas do provedor.

## 6. Rotas / UI / OpenAPI

Não são necessárias rotas novas: `registerFiscalRoutes.ts` e `FiscalProviderSection.tsx` já são agnósticos de provedor e leem de `getCapabilities()` / `FiscalProviderConfigService.getStatus()`. Atualizar o enum `FiscalProviderCode` de `docs/api/openapi.yaml` se um novo código de provedor foi adicionado no passo 1.

## 7. Testes

No mínimo, replicar `tests/server/fiscal/arca/arcaFiscalAdapter.test.ts` (testes unitários do adapter contra um `PrismaClient` mockado) e remover o caso correspondente de `tests/server/fiscal/stubs/fiscalStubs.test.ts` quando o stub for substituído. Não reduzir os limiares de cobertura de `vitest.config.ts`.

## 8. Documentação

Atualizar a lista de provedores deste guia abaixo e adicionar uma nota na seção "Consequências"/"Não evidenciado" da [ADR-0018](../adr/ADR-0018-fiscal-multi-organism-e-invoicing.md) refletindo a nova integração real, nos três idiomas (`docs/en/`, `docs/es/`, `docs/pt-br/`).

## Status atual dos provedores (evidenciado no código)

| Provedor | `providerCode` | `implemented` | Fonte |
|---|---|---|---|
| ARCA / AFIP (Argentina) | `arca_wsfe` | `true` (mock de homologação) | `apps/server/fiscal/arca/ArcaFiscalAdapter.ts` → `apps/server/fiscal/ar/ArcaService.ts` |
| DGI (Uruguai) | `uruguay_dgi` | `false` (stub de capacidades) | `apps/server/fiscal/stubs/UruguayDgiFiscalAdapter.ts` |
| SII (Chile) | `chile_sii` | `false` (stub de capacidades) | `apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts` |
| SAT/PAC (México) | `mexico_sat_pac` | `true` (mock PAC de homologação; live não evidenciado) | `apps/server/fiscal/mx/MexicoSatFiscalAdapter.ts` → `MexicoSatService` + `mxSatPacMock` ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)) |
