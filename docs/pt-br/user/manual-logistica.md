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

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/ordenes-entrega`, `/api/compras`.

**Outros idiomas:** [English](../../en/user/manual-logistics.md) · [Español](../../es/user/manual-logistica.md)
