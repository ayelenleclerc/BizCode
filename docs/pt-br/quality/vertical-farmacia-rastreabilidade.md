# Vertical farmácia — MVP de rastreabilidade local (#204)

**Papel do documento:** guia de qualidade de produto para a vertical farmácia (receitas, livro interno de psicotrópicos, captura de serial unitário).  
**Issue relacionada:** [#204](https://github.com/ayelenleclerc/BizCode/issues/204)

Este MVP é um **registro local auditável**. **Não** afirma envio ao Sistema Nacional de Rastreabilidade (SNT) da ANMAT, formato oficial de declaração ao SEDRONAR, leitor GS1/DataMatrix nem conformidade regulatória. A revisão jurídica continua pendente, conforme exige a issue.

## Escopo (MVP)

| Item | Evidência no repositório |
|------|--------------------------|
| Gate de módulo | `vertical.pharmacy` em [`modules-catalog.ts`](../../../packages/types/src/modules-catalog.ts) (depende de `inventory.lots`); as rotas retornam `403 MODULE_NOT_ENABLED` |
| Persistência | Prisma `RecetaDispensacion`, `LibroPsicotropicoMovimiento`, `Articulo.requiereReceta`, `Articulo.esPsicotropico`, `Lote.serialUnidad`, `Lote.codigoDatamatrix` (migração `20260828120000_pharmacy_vertical_204`) |
| Lógica pura | [`farmaciaDispensingMath.ts`](../../../apps/server/services/farmaciaDispensingMath.ts) — normalização, gate de dispensação, quantidade sinalizada do livro, captura de serial, gerador de CSV |
| Orquestração | [`FarmaciaService.ts`](../../../apps/server/services/FarmaciaService.ts) |
| REST | [`registerFarmaciaRoutes.ts`](../../../apps/server/routes/registerFarmaciaRoutes.ts): `/api/farmacia/recetas`, `/api/farmacia/recetas/{id}`, `/api/farmacia/libro-psicotropicos`, `/api/farmacia/libro-psicotropicos/export`, `/api/farmacia/lotes/{id}/serial` |
| Gate de dispensação | [`FacturaService.create`](../../../apps/server/services/FacturaService.ts) rejeita com `422` quando um artigo tem `requiereReceta` e nenhum `recetaId` é enviado |
| UI | [`pages/farmacia/index.tsx`](../../../apps/web/src/pages/farmacia/index.tsx) (abas: receitas, livro, serial do lote) e alternadores de farmácia em [`ArticuloForm.tsx`](../../../apps/web/src/pages/articulos/ArticuloForm.tsx) |
| i18n | `apps/web/src/locales/{en,es,pt-BR}/farmacia.json` |
| Testes | `tests/server/farmaciaDispensingMath.test.ts`, `tests/server/services/farmaciaService.test.ts`, `tests/api/farmacia.test.ts`, `packages/api-client/src/modules/farmacia.test.ts` |

## Fluxo

1. Marcar o artigo como `requiereReceta` e/ou `esPsicotropico` na ficha (visível apenas com o módulo habilitado).
2. Registrar a receita (`POST /api/farmacia/recetas`) com número, profissional, registro profissional, data e cliente/fatura opcionais.
3. Ao faturar um artigo que exige receita, enviar `recetaId`; caso contrário a fatura é rejeitada com um `422` acionável.
4. As saídas de artigos psicotrópicos são lançadas em `LibroPsicotropicoMovimiento` após a criação da fatura, vinculadas à receita e ao lote quando existirem.
5. O serial unitário / conteúdo DataMatrix é salvo como informado no lote; não é analisado.
6. O livro é exportável em CSV para auditoria interna.

## Fora de escopo / residual

- Webservice SNT da ANMAT e ambiente de testes da ANMAT
- Formato oficial do relatório periódico do SEDRONAR
- Leitura de DataMatrix em dispositivos móveis
- Qualquer afirmação de conformidade regulatória sem revisão jurídica

## Relacionado

- Base de lotes / FEFO: `LoteService.ts`, módulos `inventory.lots` / `inventory.fefo`
- OpenAPI: `docs/api/openapi.yaml`, tag `farmacia`
- [ADR-0007](../../en/adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (modularidade vertical)
