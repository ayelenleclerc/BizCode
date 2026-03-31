# Manual do usuário: Produtos

## Acesso

Clique em **Produtos** na barra lateral.

## Lista de produtos

Colunas: **Código**, **Descrição**, **Categoria**, **IPI/ICMS**, **Preço L1**, **Preço L2**, **Estoque**, **Ativo**.

**Busca:** digite no campo (**F2** para focar); filtra por código ou descrição.

**Navegar:** **↑** / **↓** entre linhas.

**Abrir:** **Enter** ou duplo clique na linha.

## Novo produto

1. **F3** ou **➕ Novo (F3)**.
2. Preencha o formulário **Novo Produto**.
3. **F5** ou **Salvar (F5)**.

### Campos do formulário

| Campo | Obrigatório | Descrição |
|---|---|---|
| Código | Sim | Não editável após criação. |
| Descrição | Sim | Nome do produto (mín. 3, máx. 30 caracteres). |
| Categoria | Sim | Deve existir no catálogo de rubros. |
| Unidade | Sim | Unidade de venda (ex.: Un, kg, l). |
| Alíquota | Sim | 21%, 10,5% ou Isento — define a taxa na nota. |
| Preço Lista 1 | Sim | Preço principal. |
| Preço Lista 2 | Sim | Preço alternativo (ex.: atacado). |
| Custo | Sim | Para margem. |
| Estoque | Sim | Quantidade inteira não negativa. |
| Mínimo | Sim | Estoque mínimo para alertas. |
| Ativo | Sim | Desmarque para deixar de vender. |

### Alíquota do produto

| Valor | Taxa |
|---|---|
| **21%** | Padrão (maioria dos bens) |
| **10,5%** | Reduzida (alimentos básicos, etc.) |
| **Isento** | Sem IVA |

A alíquota do **produto** define a taxa; o **regime fiscal do cliente** define como o IVA aparece na nota (discriminado na Factura A ou incluído na Factura B).

## Editar produto

Selecione o produto → **Enter** ou duplo clique → altere → **F5**.

## Categorias (rubros)

As categorias classificam produtos. Inclusão ou alteração de rubros: administrador (hoje pode estar direto no banco).

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F2 | Focar busca |
| F3 | Novo produto |
| F5 | Salvar |
| ↑ / ↓ | Navegar |
| Enter | Abrir produto |
| Esc | Fechar sem salvar |

**Outros idiomas:** [English](../../en/user/manual-products.md) · [Español](../../es/user/manual-articulos.md)
