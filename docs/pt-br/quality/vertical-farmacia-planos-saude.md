# Vertical farmácia — planos de saúde / prepagas (#252)

**Papel do documento:** Guia de qualidade do produto para vendas de farmácia com plano / prepaga.  
**Issue relacionada:** [#252](https://github.com/ayelenleclerc/BizCode/issues/252)

MVP local no módulo `vertical.pharmacy`. **Não** chama webservices PAMI/Farmalink nem emite formatos proprietários OSDE/Swiss. A exportação de apresentação é um **CSV interno**.

## Escopo (MVP)

| Item | Evidência |
|------|-----------|
| Persistência | Prisma `ObraSocial`, `CoberturaOS`, `VentaConOS`, `VentaOSItem`, `PresentacionOS`, `PresentacionOSRechazo` (migração `20261117120000_obras_sociales_252`) |
| Lógica pura | [`obraSocialMath.ts`](../../../apps/server/services/obraSocialMath.ts) |
| Orquestração | [`ObraSocialService.ts`](../../../apps/server/services/ObraSocialService.ts) |
| REST | [`registerObraSocialRoutes.ts`](../../../apps/server/routes/registerObraSocialRoutes.ts) em `/api/farmacia/...` |
| UI | [`ObrasSocialesPanels.tsx`](../../../apps/web/src/pages/farmacia/ObrasSocialesPanels.tsx) |
| Testes | `tests/server/obraSocialMath.test.ts`, `tests/api/obras-sociales.test.ts` |

## Fluxo

1. Cadastro do plano + % de cobertura por tipo de produto.
2. Venda com plano → copago / crédito calculados automaticamente.
3. Apresentação mensal → vendas `presentado` → export CSV.
4. Rejeições parciais e cobrança; consulta de conta corrente.

## Fora de escopo / residual

- PAMI/Farmalink live, formatos proprietários OSDE/Swiss, vademécum remoto PAMI
- Fechamento de #252 até aceitar residuais ou estender integrações live

## Relacionado

- MVP farmácia #204: [vertical-farmacia-rastreabilidade.md](vertical-farmacia-rastreabilidade.md)
