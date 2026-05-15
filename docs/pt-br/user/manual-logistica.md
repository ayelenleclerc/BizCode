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

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/ordenes-entrega`.

**Outros idiomas:** [English](../../en/user/manual-logistics.md) · [Español](../../es/user/manual-logistica.md)
