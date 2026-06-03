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

## Desativação (exclusão lógica)

**Desativar** define `activo: false` sem apagar o registro. Use o filtro de inativos para revisar.

## Importação CSV

O modelo fixo cobre colunas básicas; campos bancários/comerciais entram pela UI ou API após a importação.

**API:** `GET/POST /api/proveedores`, `GET/PUT/DELETE /api/proveedores/{id}` — veja [OpenAPI](../../api/openapi.yaml).

**Outros idiomas:** [English](../../en/user/manual-suppliers.md) · [Español](../../es/user/manual-proveedores.md)
