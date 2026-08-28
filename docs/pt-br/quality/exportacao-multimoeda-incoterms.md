# Vertical exportação — multimoeda, Incoterms e despachante (#206)

**Módulo:** `vertical.export` (depende de `catalog.multicurrency`) · **Plano:** enterprise

MVP que permite denominar uma fatura em moeda estrangeira com taxa de câmbio explícita, registrar o Incoterm e o país de destino, separar o saldo do cliente por moeda e enviar por email ao despachante aduaneiro o detalhe do pedido.

## Escopo

### Implementado

| Capacidade | Evidência |
|---|---|
| Moeda, total e cotação da operação na fatura | `Factura.monedaOperacion`, `Factura.totalMonedaOperacion`, `Factura.incoterm`, `Factura.paisDestino` em [prisma/schema.prisma](../../../prisma/schema.prisma) |
| Incoterm e destino no pedido mais o contato do despachante | `Pedido.incoterm`, `Pedido.paisDestino`, `Pedido.despachanteNombre`, `Pedido.despachanteEmail` |
| Saldo corrente por moeda | `MovimientoClienteCC.moneda` e `ClienteCuentaCorrienteService.getSaldosPorMoneda` |
| Regras de validação | [apps/server/services/exportOperationMath.ts](../../../apps/server/services/exportOperationMath.ts) |
| Catálogo de Incoterms e aviso ao despachante | [apps/server/routes/registerExportacionRoutes.ts](../../../apps/server/routes/registerExportacionRoutes.ts) |
| Relatório de vendas com detalhamento por moeda | `ReportesOperacionalesService.getVentasPorPeriodo` → `porMoneda[]` |

### Fora de escopo (residual)

- Comprovante AFIP de exportação tipo E (`CbteTipo=19`) com `MonId` / `MonCotiz`. `arcaWsfeMock.ts` é um mock de homologação que aceita apenas A/B/C e `libroIvaVentas` fixa `COD_MONEDA_PES`. A integração WSFE real é pré-requisito (#133).
- Liquidação de divisas no MULC.
- Qualquer afirmação de conformidade cambial.

## Regras de domínio

`normalizeExportFields` é a única fonte de verdade e rejeita com `422`:

- O Incoterm deve pertencer às 11 regras Incoterms 2020 (`EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF`).
- O país de destino deve ser um código ISO-3166-1 alpha-2.
- As moedas suportadas refletem o catálogo FX de #243: `ARS`, `USD`, `EUR`.
- Uma moeda diferente de `ARS` exige `totalMonedaOperacion` e `tipoCambioOperacion` positivos.

`Factura.total` permanece sempre em moeda local; a cotação da operação é persistida nas colunas de snapshot FX existentes (`tipoCambioValor`, `tipoCambioMoneda`, `tipoCambioFecha`).

## Conta corrente

`MovimientoClienteCC.moneda` tem default `'ARS'`, de modo que todo lançamento anterior a #206 mantém seu significado. O saldo corrente de `saldoPost` passa a ser calculado por par `(cliente, moeda)`, e `Cliente.balance` continua refletindo apenas o livro em moeda local, do qual dependem o controle de limite de crédito e a UI atual.

`GET /api/clientes/{id}/cuenta-corriente/saldo` devolve o saldo local mais `saldosPorMoneda[]`. A antiguidade (`/antiguedad`) é calculada por moeda: a moeda local também abrange as faturas sem dados de exportação.

## Endpoints

| Método | Rota | Permissão |
|---|---|---|
| GET | `/api/exportacion/incoterms` | `products.read` |
| POST | `/api/pedidos/{id}/notificar-despachante` | `orders.create` |

Ambos exigem `vertical.export`; caso contrário respondem `403 MODULE_NOT_ENABLED`. A notificação salva o contato do despachante no pedido, envia um resumo em texto simples e registra o evento de auditoria `pedido_notificar_despachante`. Se o SMTP não estiver configurado a resposta devolve `enviado: false` e a tentativa é auditada mesmo assim. Nenhuma declaração aduaneira é apresentada.

Contrato: [docs/api/openapi.yaml](../../api/openapi.yaml), tag `exportacion`.

## Interface de usuário

- Formulário de fatura: seletor de moeda, cotação pré-carregada com a taxa vigente (`tiposCambioAPI.getVigente`) e editável, Incoterm e país de destino. O painel só aparece com o módulo ativo.
- Pedidos: Incoterm, destino e contato do despachante na criação, mais uma ação «Notificar despachante» por linha.
- Aba de conta corrente: saldo por moeda.

Todos os textos estão traduzidos em EN/ES/PT-BR e cada controle expõe um `data-testid` estável.

## Testes

- [tests/server/exportOperationMath.test.ts](../../../tests/server/exportOperationMath.test.ts) — regras puras de domínio.
- [tests/api/exportacion.test.ts](../../../tests/api/exportacion.test.ts) — gate de módulo, catálogo e notificação.
- [tests/server/services/clienteCuentaCorrienteService.test.ts](../../../tests/server/services/clienteCuentaCorrienteService.test.ts) — livro por moeda.
- [packages/api-client/src/modules/exportacion.test.ts](../../../packages/api-client/src/modules/exportacion.test.ts) — cliente HTTP.
- `apps/web/src/pages/clientes/ClienteCuentaCorrienteSection.test.tsx` — painel de saldo.
