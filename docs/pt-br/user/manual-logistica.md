# Manual do usuário: Logística

## Acesso

Clique em **Logística** na barra lateral.

É necessário **`logistics.read`** ou **`orders.deliver.confirm`**. Motoristas (`role: driver`) veem uma lista restrita.

## Filtrar ordens de entrega

| Filtro | Descrição |
|--------|-----------|
| Data | Data de entrega (padrão: hoje). |
| Status | `pending`, `picking`, `ready`, `assigned`, `in_transit`, `delivered`, `failed`, `cancelled`, ou todos. |
| Zona | Zona de entrega (visão planejador). |

## Criar uma ordem

Com **`orders.create`**, abra o formulário de nova ordem, informe id do cliente, data, zona, motorista e observação opcionais, e salve (`POST /api/ordenes-entrega`).

## Atualizar status

Usuários com **`orders.dispatch`** ou **`orders.deliver.confirm`** podem alterar o estado da ordem pelos controles da UI (`PUT /api/ordenes-entrega/:id`).

## Picking no depósito

Abra **Picking** (`/logistica/picking`) pela barra lateral ou pelo link na página de logística. Requer o módulo **`logistics.picking`**, permissão **`orders.pick`** e papéis como **`warehouse_op`** ou **`warehouse_lead`**.

| Etapa | Ação |
|-------|------|
| Fila | OEs em `pending`, ordenadas por zona e data |
| Assumir | `POST /api/ordenes-entrega/{id}/iniciar-picking` → `picking` (usuário da sessão como separador) |
| Checklist | Itens da fatura vinculada (se houver); confirmação na UI |
| Pronta | `POST /api/ordenes-entrega/{id}/lista` → `ready` |

Uma OE em `picking` fica bloqueada para outros operadores (`409 PICKING_ASSIGNED_TO_OTHER_USER`). O líder vê OEs `ready` e planeja o reparto em **Repartos**.

## Repartos

Abra **Repartos** pelo link na página de logística ou navegue para `/logistica/repartos`. A rota usa o módulo **`logistics.dispatches`**.

| Permissão | Uso |
|-----------|-----|
| `logistics.read` | Listar e ver detalhe dos repartos |
| `orders.dispatch` | Criar reparto, iniciar (`iniciar`) e fechar (`cerrar`) |

**Status do reparto:** `planned` → `on_route` → `completed` (no modelo também `cancelled`; sem API de cancelamento por enquanto).

| Etapa | Ação |
|-------|------|
| Planejar | `POST /api/repartos` — motorista, veículo/notas opcionais, OEs em estado **`ready`** em sequência (UI com arrastar e teclado); OEs passam a `assigned` com `driverId` |
| Iniciar | `POST /api/repartos/{id}/iniciar` — `planned` → `on_route`; OEs dos itens pendentes → `in_transit` |
| Fechar | `POST /api/repartos/{id}/cerrar` — `on_route` → `completed`; itens `pending` → `not_delivered` e OEs vinculadas → `failed` |

Uma OE não pode estar em dois repartos ativos (`planned` ou `on_route`) ao mesmo tempo (`422 ORDEN_ALREADY_IN_ACTIVE_REPARTO`).

## Comprovante de entrega (POD)

Módulo **`logistics.pod`** (depende de **`logistics.dispatches`**). Motoristas com **`orders.deliver.confirm`** usam **`/logistica/repartos/chofer`** (mobile-first) quando o reparto está **`on_route`**.

| Etapa | Ação |
|-------|------|
| Receptor | Nome obrigatório; documento opcional |
| Assinatura | Canvas; obrigatória para confirmar entrega |
| Foto | Opcional; compressão no cliente |
| Confirmar | Notas; ou **não entregue** com motivo (`ausente`, `rechazo`, `domicilio_incorrecto`, `producto_dañado`, `otro`) |

| API | Permissão / papel |
|-----|-------------------|
| `PUT /api/repartos/{id}/items/{itemId}` | `orders.deliver.confirm`; motorista só no próprio reparto `on_route` |
| `GET /api/repartos/{id}/items/{itemId}/pod` | `logistics.read` + `owner`, `manager` ou `logistics_planner` (não `driver`) |

Listagens/detalhe expõem **`hasPod`** sem blobs. Limites decodificados: assinatura ~50KB, foto ~200KB. Assinatura vazia não confirma entrega.

Back-office: em **`/logistica/repartos`**, painel de acompanhamento com badge **POD disponível** e **Ver comprovante** quando `hasPod`.

## Ordens de compra

Abra **Compras** (`/compras`) na barra lateral. A rota depende do módulo do tenant **`logistics.purchases`** e é visível para papéis como **owner**, **manager** e **warehouse_lead** (conforme a configuração de navegação do produto).

| Permissão | Uso |
|-----------|-----|
| `suppliers.read` | Listar e ver ordens de compra |
| `suppliers.manage` | Criar, editar rascunhos, enviar, cancelar e receber |
| `inventory.adjust` | Obrigatório junto com `suppliers.manage` no **recebimento** (incremento de estoque) |

**Fluxo de status:** `draft` → `sent` → `received` (quando todas as linhas forem recebidas por completo) ou `cancelled`. Enquanto o status for `sent`, é possível **receber quantidades parciais** por linha; cada recebimento cria um `StockAjuste` com motivo `compra` e atualiza o estoque do artigo em uma única transação.

Rotas API usuais: `GET/POST /api/compras`, `GET/PUT /api/compras/{id}`, `POST /api/compras/{id}/send`, `POST /api/compras/{id}/cancel`, `POST /api/compras/{id}/receive`.

## Contagem física de inventário

Abra **Contagem** (`/recuentos`) na barra lateral. A rota depende do módulo do tenant **`inventory.count`** e exige a permissão `inventory.count` (papéis como **owner**, **manager**, **warehouse_lead**).

| Etapa | Ação |
|-------|------|
| Início | `POST /api/recuentos` — snapshot do estoque dos artigos ativos (`cantSistema`); apenas uma contagem `in_progress` por tenant |
| Contagem | `PUT /api/recuentos/{id}/items` — registrar `cantFisica` por artigo (atualizações parciais) |
| Fechamento | `POST /api/recuentos/{id}/close` — todos os itens devem estar contados; diferenças não zero atualizam estoque e criam `StockAjuste` com motivo `recuento`; diferença zero não gera ajuste |
| Relatório | `GET /api/recuentos/{id}/pdf` — PDF de diferenças (somente contagens fechadas) |

Enquanto uma contagem está `in_progress`, mutações de estoque ficam bloqueadas (`422 RECUENTO_IN_PROGRESS`) em ajustes, recebimento de compras e baixa por faturamento.

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/ordenes-entrega`, `/api/repartos`, `/api/compras`, `/api/recuentos`.

**Outros idiomas:** [English](../../en/user/manual-logistics.md) · [Español](../../es/user/manual-logistica.md)
