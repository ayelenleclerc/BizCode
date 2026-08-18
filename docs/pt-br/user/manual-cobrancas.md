# Manual do usuário: Cobranças

## Acesso

Clique em **Cobranças** na barra lateral, ou abra um cliente e use os links **Registrar cobrança** / cobranças recentes quando disponíveis.

É necessário o permissão **`sales.create`** para registrar uma cobrança.

## Lista de cobranças

A tabela mostra data, cliente, valor e referência. Use os filtros:

| Filtro | Descrição |
|--------|-----------|
| Cliente | Id numérico do cliente (opcional). |
| De / Até | Intervalo de datas (`AAAA-MM-DD`). |
| Filtrar | Aplica os filtros e recarrega a lista. |

Link direto: `/cobros?clienteId=<id>` abre a lista com esse filtro de cliente e o diálogo de nova cobrança.

## Registrar uma cobrança

1. Clique em **Nova cobrança** (visível com `sales.create`).
2. Selecione **Cliente**, **Data** e **Valor** (obrigatório, maior que zero).
3. Opcionalmente escolha **Forma de pagamento**, **Referência** e **Observação**.
4. Clique em **Salvar**.

Em caso de sucesso, o saldo do cliente diminui pelo valor da cobrança. Se o cliente tiver ao menos uma fatura ativa, o **score de cobrança** pode mudar conforme as regras do servidor (ver OpenAPI `POST /api/cobros`).

### Erros

| Situação | Comportamento |
|----------|---------------|
| Cliente suspenso ou inativo | HTTP 422; mensagem na UI |
| Sem permissão | Controle oculto ou API 403 |
| Valor inválido | Validação antes do envio |

## Cobranças App Entregador (#162)

O motorista **não** recebe `sales.create`. No App Driver, **Cobrar** em uma parada abre `/cobros?clienteId=` e chama o mesmo `POST /api/cobros` com `orders.deliver.confirm`, header `x-bizcode-channel: field` e um cliente de `mi-reparto` de hoje. Os checkboxes de faturas só montam o valor padrão (sem imputação ReciboCobro). WhatsApp é um link local `wa.me` com texto editável (sem Twilio, sem PDF). A cobrança aparece nesta lista web na hora (`reports.operational.read`).

## Referência API

Contrato: [`docs/api/openapi.yaml`](../../api/openapi.yaml) — tag `cobros`. Swagger UI: `/api-docs` com a API em execução.

**Outros idiomas:** [English](../../en/user/manual-collections.md) · [Español](../../es/user/manual-cobros.md)
