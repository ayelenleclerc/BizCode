# ADR-0023: Registro de regras fiscais por país

**Status:** Aceito  
**Data:** 2026-09-03  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2 (design de software)

---

## Contexto

As issues [#207](https://github.com/ayelenleclerc/BizCode/issues/207), [#437](https://github.com/ayelenleclerc/BizCode/issues/437) e [#208](https://github.com/ayelenleclerc/BizCode/issues/208) fizeram a jurisdição do tenant governar IVA, algoritmos de identificador fiscal, aplicabilidade de módulos e seleção de adapter. Uma auditoria para [#440](https://github.com/ayelenleclerc/BizCode/issues/440) mostrou que o restante da legislação argentina continuava fixo em camadas que se apresentam como neutras:

- Schemas Zod do servidor exigiam CUIT/CBU argentinos e `RI|Mono|CF|Exento`.
- O motor de faturas decidia quem paga IVA comparando com `CF` e `Exento`.
- Rótulos de IVA (`21%`, `10.5%`) e letras `A|B|C` estavam em JSX e locales.
- Exportações do Libro IVA pendiam de `finance.ledger` (não AR-only), e `echeq` era método genérico de recibo apesar de `fiscal.cheques` ser AR-only.

[ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) ponto 3 e [ADR-0022](ADR-0022-legal-module-activation-by-jurisdiction.md) exigem comportamento fiscal como camadas por país.

Opções consideradas:

1. Adicionar `if (jurisdiction === 'AR')` em torno de cada código argentino.
2. Manter algoritmos em `apps/web` e importá-los no servidor por caminho relativo.
3. **Declarar um `FiscalRuleSet` por país em `packages/types/src/fiscal/` e fazer o núcleo ler o registro** — escolhida.

## Decisão

1. Cada país possui um `FiscalRuleSet` em `packages/types/src/fiscal/countries/`.
2. `registry.ts` expõe `getFiscalRules`, `subjectPaysVat`, `getVatRateCodes`, `getDocumentKinds`.
3. Algoritmos puros de identificador vivem em `packages/types/src/fiscal/identifiers/` e são reexportados de `apps/web/src/lib/validators.ts`.
4. `validateBodyForTenant(prisma, buildSchema)` resolve a jurisdição do tenant e constrói schemas Zod por request (cliente, fornecedor, empresa).
5. Selects de UI derivam do registro (`apps/web/src/lib/fiscal/uiOptions.ts`). `calculateInvoice` recebe a jurisdição.
6. `fiscal.libro_iva` é AR-only; `echeq` só é aceito em recibos de fornecedor quando `fiscal.cheques` está habilitado.
7. Condições fiscais de UY e CL são **modelo de produto**, não catálogo oficial DGI/SII.

## Consequências

- Adicionar jurisdição é majoritariamente declarativo.
- Códigos argentinos persistidos permanecem válidos.
- Tenants AR que só tinham `finance.ledger` precisam de `fiscal.libro_iva` para exportações Libro IVA.

## Relacionado

- Issue [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [ADR-0022](ADR-0022-legal-module-activation-by-jurisdiction.md)
- Guia: [conjuntos-regras-fiscais-por-pais.md](../quality/conjuntos-regras-fiscais-por-pais.md)
