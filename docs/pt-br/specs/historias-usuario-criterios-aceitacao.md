# Histórias de usuário e critérios de aceitação (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.2 |
| Revisão | 2 |
| Data | 2026-05-15 |
| Referência ao produto | BizCode 0.1.0 MVP |

Formato: critérios **Given / When / Then** são de verificação **manual**, salvo vínculo a testes automatizados existentes.

## HU-01 — Cadastro de clientes

- **História:** Como operador, quero criar, buscar e editar clientes para manter o cadastro mestre.
- **Critérios (Given/When/Then):**
  - Dado que estou na página Clientes, quando busco por texto/código, então a lista filtra conforme o comportamento da API.
  - Dado que salvo um cliente válido, quando a API responde com sucesso, então a lista reflete a alteração (ou posso reabrir o registro).
- **Evidência:** `src/pages/clientes/`, `GET/POST/PUT /api/clientes`.

## HU-02 — Cadastro de produtos

- **História:** Como operador, quero manter produtos com rubro e condição de IVA para usá-los em faturas.
- **Critérios:**
  - Dado que edito um produto, quando seleciono um rubro na lista, então ele provém dos rubros retornados por `GET /api/rubros`.
- **Evidência:** `src/pages/articulos/`, `GET /api/articulos`, `GET /api/rubros`.

## HU-03 — Emissão de faturas

- **História:** Como operador, quero emitir faturas com itens e totais para registrar vendas.
- **Critérios:**
  - Dado que crio uma fatura, quando adiciono ao menos uma linha e seleciono um cliente, então salvar é habilitado conforme as regras da UI documentadas no manual do usuário.
- **Evidência:** `src/pages/facturacion/`, `GET/POST /api/facturas`, `GET /api/formas-pago`.

## HU-04 — Tema

- **História:** Como operador, quero alternar tema claro/escuro e manter a escolha neste equipamento.
- **Critérios:**
  - Dado que altero o tema, quando recarrego o app, então o tema coincide com `localStorage` e o comportamento da classe em `<html>` conforme [temas-interface.md](../temas-interface.md).
- **Evidência:** `Layout.tsx`, `index.html`.

## HU-05 — Idioma

- **História:** Como operador, quero usar a UI em espanhol, inglês ou português brasileiro.
- **Critérios:**
  - Dado que altero o idioma, quando navego pelos módulos, então não há strings visíveis ao usuário fora de `t()` (política).
- **Evidência:** [estrategia-i18n.md](../estrategia-i18n.md).

## HU-06 — Cobranças de clientes

- **História:** Como operador, quero registrar e listar cobranças de clientes para acompanhar saldos e recebimentos.
- **Critérios:**
  - Dado que tenho `sales.create`, quando salvo uma cobrança válida, então `POST /api/cobros` responde com sucesso e a lista é atualizada.
  - Dado um cliente suspenso ou inativo, quando registro uma cobrança, então a API retorna 422 conforme OpenAPI.
- **Evidência:** `src/pages/cobros/`, `tests/api/cobros.test.ts`.

## HU-07 — Contas a receber e extrato

- **História:** Como usuário de finanças, quero aging e extrato por cliente para acompanhar recebíveis.
- **Critérios:**
  - Dado `reports.financial.read`, quando abro Finanças, então as faixas de aging carregam de `GET /api/reportes/aging`.
  - Dado um id de cliente válido, quando solicito o extrato, então as linhas mostram saldo acumulado de `GET /api/reportes/cuenta-corriente/:clienteId`.
- **Evidência:** `src/pages/finanzas/`.

## HU-08 — Relatórios

- **História:** Como gestor, quero relatórios de vendas, estoque e cobranças por período, com exportação CSV quando necessário.
- **Critérios:**
  - Dado permissão operacional, quando abro a aba vendas ou estoque, então os dados carregam do endpoint `/api/reportes/*` correspondente.
  - Dado permissão financeira, quando exporto cobranças com cabeçalho CSV, então a UI inicia o download do arquivo.
- **Evidência:** `src/pages/reportes/`.

## HU-09 — Ordens de entrega

- **História:** Como equipe de logística, quero planejar e atualizar ordens de entrega por data e zona.
- **Critérios:**
  - Dado `logistics.read`, quando filtro por data/estado, então o listado vem de `GET /api/ordenes-entrega`.
  - Dado `orders.create`, quando envio uma ordem nova, então `POST /api/ordenes-entrega` cria o registro.
- **Evidência:** `src/pages/logistica/`, `registerOrdenesEntregaRoutes.ts`.

## HU-10 — Picking no depósito

- **História:** Como equipe de depósito, quero retirar ordens da fila e marcá-las prontas para despacho.
- **Critérios:**
  - Dado `orders.pick` e `logistics.picking`, quando completo o checklist, então o estado passa a `ready`.
- **Evidência:** `src/pages/logistica/picking/`, endpoints de picking em `registerOrdenesEntregaRoutes.ts`.

## HU-11 — Repartos

- **História:** Como planejador, quero agrupar OE prontas em um reparto, iniciá-lo e fechá-lo ao terminar.
- **Critérios:**
  - Dado `orders.dispatch` e `logistics.dispatches`, quando crio e inicio um reparto, então fica `on_route` com OE vinculadas.
- **Evidência:** `src/pages/logistica/repartos/`, `registerRepartosRoutes.ts`.

## HU-12 — Comprovante de entrega (POD)

- **História:** Como motorista, quero confirmar cada parada com assinatura para deixar prova.
- **Critérios:**
  - Dado `orders.deliver.confirm` e `logistics.pod`, quando envio POD de um item, então fica `delivered` e o comprovante é consultável.
- **Evidência:** `src/pages/logistica/repartos/chofer/`, `PUT .../items/{itemId}`, `GET .../pod`.

## HU-13 — Rastreamento GPS ao vivo

- **História:** Como planejador, quero ver repartos ativos no mapa; como motorista, enviar minha localização na rota.
- **Critérios:**
  - Dado `logistics.gps`, quando o reparto está `on_route`, então o mapa mostra a última posição e o motorista pode publicar localização periodicamente.
- **Evidência:** `src/pages/logistica/seguimiento/`, `RepartoUbicacionService.ts`, `GET /api/repartos/activos`.

**Outros idiomas:** [English](../../en/specs/user-stories-and-acceptance.md) · [Español](../../es/specs/historias-usuario-criterios-aceptacion.md)
