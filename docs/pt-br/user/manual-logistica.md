# Manual do usuário: Logística

## Acesso

Clique em **Logística** na barra lateral.

É necessário **`logistics.read`** ou **`orders.deliver.confirm`**. Motoristas (`role: driver`) veem uma lista restrita.

## Filtrar ordens de entrega

| Filtro | Descrição |
|--------|-----------|
| Data | Data de entrega (padrão: hoje). |
| Status | `pending`, `assigned`, `in_transit`, `delivered`, `failed`, ou todos. |
| Zona | Zona de entrega (visão planejador). |

## Criar uma ordem

Com **`orders.create`**, abra o formulário de nova ordem, informe id do cliente, data, zona, motorista e observação opcionais, e salve (`POST /api/ordenes-entrega`).

## Atualizar status

Usuários com **`orders.dispatch`** ou **`orders.deliver.confirm`** podem alterar o estado da ordem pelos controles da UI (`PUT /api/ordenes-entrega/:id`).

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

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/ordenes-entrega`, `/api/compras`, `/api/recuentos`.

**Outros idiomas:** [English](../../en/user/manual-logistics.md) · [Español](../../es/user/manual-logistica.md)
