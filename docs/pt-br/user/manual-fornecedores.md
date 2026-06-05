# Manual do usuário — Fornecedores

**Permissões:** `suppliers.read` (listar e ver), `suppliers.manage` (criar, editar, desativar, importar CSV).

## Listagem

- Busca por código ou razão social (F2 foca o campo).
- Filtros por **status** (todos / ativos / inativos) e **categoria** (matéria-prima, insumos, serviços, logística).
- Badges na tabela: **ativo** / **inativo**.

## Ficha completa (GitHub #269)

**Novo** (F3) ou linha selecionada + **Editar**. Seções do formulário:

1. **Dados gerais** — código, categoria, razão social, fantasia, CNPJ/CPF (validado), regime fiscal, telefone, e-mail, ativo.
2. **Dados bancários** — CBU (dígito verificador), alias, banco, tipo de conta, moeda (ARS padrão).
3. **Condição comercial** — condição de pagamento, prazo habitual, desconto %, limite de crédito.
4. **Contato e notas** — nome, e-mail e telefone do contato, notas.

Atalhos: **F5** salvar, **Esc** cancelar.

## Conta corrente (GitHub #270)

Em fornecedores **existentes**, aba **Conta corrente**:

- **Saldo atual** (dívida acumulada pelos movimentos).
- Alerta quando o saldo ultrapassa o **limite de crédito** da ficha.
- **Gráfico** de evolução da dívida (últimos 6 meses).
- **Tabela de movimentos** com filtros por tipo e datas.
- **Ajuste manual** (`suppliers.manage`): valor diferente de zero e motivo obrigatório; auditoria `proveedor_cc_ajuste`.

Ao registrar um **comprovante de compra** ativo (`POST /api/comprobantes-compra`, módulo `finance.ledger`) é criado movimento `factura_compra` pelo total.

**API:** `GET /api/proveedores/{id}/cuenta-corriente`, `GET .../saldo`, `POST .../cuenta-corriente/ajuste` — [OpenAPI](../../api/openapi.yaml).

## Recibos de pagamento (GitHub #271)

Na aba **Conta corrente**, o bloco **Recibos de pagamento** registra pagamentos ao fornecedor (módulo `finance.receipts`, `suppliers.manage`):

1. **Registrar pagamento** — comprovantes pendentes (mais antigos primeiro); selecione linhas e valores (parcial ou total).
2. Data, forma (transferência, cheque, dinheiro, eCheq), CBU/referência/notas opcionais.
3. Ao salvar: número correlativo por tenant, movimento `pago` na CC (valor negativo) e auditoria `recibo_pago_create`.
4. **Baixar PDF** por recibo; **Anular** (`recibo_pago_void`) reverte o saldo com movimento compensatório.

**API:** `GET /api/proveedores/{id}/pagos/comprobantes-pendientes`, `GET/POST /api/proveedores/{id}/pagos`, `POST .../pagos/{reciboId}/anular`, `GET .../pagos/{reciboId}/pdf` — [OpenAPI](../../api/openapi.yaml).

## Desativação (exclusão lógica)

**Desativar** define `activo: false` sem apagar o registro. Use o filtro de inativos para revisar.

## Importação CSV

O modelo fixo cobre colunas básicas; campos bancários/comerciais entram pela UI ou API após a importação.

**API:** `GET/POST /api/proveedores`, `GET/PUT/DELETE /api/proveedores/{id}` — veja [OpenAPI](../../api/openapi.yaml).

**Outros idiomas:** [English](../../en/user/manual-suppliers.md) · [Español](../../es/user/manual-proveedores.md)
