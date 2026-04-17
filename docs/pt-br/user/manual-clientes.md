# Manual do usuário: Clientes

## Acesso

Clique em **Clientes** na barra lateral ou navegue com as setas e **Enter**.

## Lista de clientes

Tabela com: **Código**, **Razão Social**, **CNPJ/CPF**, **Regime Fiscal**, **Telefone**, **Ativo**.

**Busca:** digite no campo (ou **F2** para focar). Filtra por código, razão social ou identificador.

**Navegar:** **↑** / **↓** para mover entre linhas; a linha selecionada fica destacada.

**Abrir para edição:** com uma linha selecionada, **Enter** ou duplo clique.

## Novo cliente

1. **F3** ou **➕ Novo (F3)**.
2. Abre o formulário **Novo Cliente**.
3. Preencha os campos e **F5** ou **Salvar (F5)**.

### Campos do formulário

| Campo | Obrigatório | Descrição |
|---|---|---|
| Código | Sim | Inteiro positivo. Não pode ser alterado após a criação. |
| Razão Social | Sim | Nome legal ou completo. Mínimo 3 caracteres. |
| Nome Fantasia | Não | Nome comercial (se diferente da razão social). |
| CNPJ/CPF | Não | Identificador fiscal (no código: validação tipo CUIT argentino). Formato `XX-XXXXXXXX-X`. |
| Regime Fiscal | Sim | RI, MEI/Simples, CF ou Isento — ver tabela abaixo. |
| Endereço | Não | Rua e número. |
| Cidade | Não | Localidade. |
| CEP | Não | Até 8 caracteres. |
| Telefone | Não | |
| E-mail | Não | |
| Ativo | Sim | Desmarque para inativar sem apagar histórico. |

### Regime fiscal (condição de IVA)

| Valor | Descrição na interface (pt-BR) | Nota fiscal típica (Argentina) |
|---|---|---|
| **RI** | RI - Contribuinte ICMS | Factura A (IVA discriminado) |
| **Mono** | MEI / Simples | Factura B (IVA incluído) |
| **CF** | CF - Consumidor Final | Factura B (IVA incluído) |
| **Isento** | Isento | Factura A ou B sem IVA, conforme regra |

### Validação do identificador

O sistema valida o dígito verificador. Em caso de erro, a mensagem é **«CNPJ/CPF inválido»**. Pode informar com ou sem hífens.

## Editar cliente

1. Selecione o cliente na tabela.
2. **Enter** ou duplo clique.
3. Altere os campos (o **Código** não é editável).
4. **F5** ou **Salvar (F5)**.

## Inativar cliente

Edite o cliente e desmarque **Ativo**. O registro permanece para histórico de faturas.

## Importação em massa (CSV)

Usuários com permissão de gestão de clientes podem carregar muitos registros a partir de um arquivo **CSV em UTF-8**.

1. Na lista, abra **Importar CSV** (ou o controle equivalente).
2. **Baixe o modelo** no mesmo diálogo: inclui a linha de cabeçalhos obrigatória e um exemplo.
3. Não altere os nomes nem a ordem das colunas da primeira linha. Salve como `.csv` (UTF-8).
4. Anexe o arquivo e confirme. O sistema informa quantas linhas foram criadas e, se houver erros de validação ou duplicados, o detalhe **por linha** (a numeração das linhas de dados começa após o cabeçalho; a linha 1 é o cabeçalho).

**Política de duplicados:** se o **código** do cliente já existir na base ou estiver repetido no mesmo arquivo, a linha é rejeitada.

**Limites:** tamanho máximo do arquivo e quantidade máxima de linhas são aplicados pela API (veja OpenAPI em `/api-docs`).

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F2 | Focar busca |
| F3 | Novo cliente |
| F5 | Salvar formulário |
| ↑ / ↓ | Navegar linhas |
| Enter | Abrir cliente selecionado |
| Esc | Fechar formulário ou diálogo de importação sem salvar |

**Outros idiomas:** [English](../../en/user/manual-customers.md) · [Español](../../es/user/manual-clientes.md)
