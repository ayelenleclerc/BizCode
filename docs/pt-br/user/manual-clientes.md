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

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F2 | Focar busca |
| F3 | Novo cliente |
| F5 | Salvar formulário |
| ↑ / ↓ | Navegar linhas |
| Enter | Abrir cliente selecionado |
| Esc | Fechar sem salvar |

**Outros idiomas:** [English](../../en/user/manual-customers.md) · [Español](../../es/user/manual-clientes.md)
