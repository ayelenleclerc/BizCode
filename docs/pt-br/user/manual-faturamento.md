# Manual do usuário: Faturamento

## Acesso

Clique em **Faturamento** na barra lateral (`nav.facturacion`).

## Lista de notas fiscais

Exibe as notas emitidas com: **Data**, **Tipo** (**NF-e Tipo A** / **NF-e Tipo B**), **Nº**, **Cliente**, bases, **Impostos**, **Total**, **Situação** (Ativa / Cancelada).

**Detalhe:** clique numa linha para expandir itens e discriminação de impostos.

## Nova nota fiscal

1. **F3** ou **➕ Nova Nota Fiscal (F3)**.
2. Preencha o cabeçalho.
3. Adicione linhas de itens.
4. **F5** ou **✓ Salvar NF (F5)**.

### Cabeçalho

| Campo | Obrigatório | Descrição |
|---|---|---|
| Tipo | Sim | **NF-e Tipo A** (cliente RI) ou **NF-e Tipo B** (CF, Mono, etc.). |
| Prefixo | Não | Ponto de venda (até 4 caracteres, ex.: `0001`). |
| Número | Sim | Número do comprovante. |
| Data | Sim | Data de emissão (padrão: hoje). |
| Cliente | Sim | Selecione na lista (`Selecionar...`). |

### Escolha do tipo

- **NF-e Tipo A:** clientes com regime **RI**; impostos discriminados por linha; o cliente pode creditar IVA de compra.
- **NF-e Tipo B:** **CF**, **MEI/Simples** ou **Isento**; IVA incluído no preço (não discriminado na nota).

### Linhas de itens

1. **Ins** ou **➕ Adicionar Item (Ins)** para nova linha.
2. Em cada linha, selecione o **Produto**; o preço preenche com a Lista 1.
3. **Qtd.** (padrão: 1).
4. **Preço** se necessário.
5. **Desc %** (0 = sem desconto).
6. **Subtotal** calculado: `Qtd × Preço × (1 − Desc%/100)`.

**Remover linha:** selecione a linha e **Del**.

### Totais automáticos

| Coluna | Descrição |
|---|---|
| **Base 21%** | Soma dos subtotais com alíquota 21% (sem IVA). |
| **Base 10,5%** | Idem para 10,5%. |
| **Base Isenta** | Itens isentos. |
| **Impostos** | Total de impostos (21% + 10,5%). Para CF/Mono: ainda calculado internamente. |
| **TOTAL** | Base + impostos. |

**Nota:** para **CF** e **Mono**, o total inclui IVA, mas a **NF tipo B** não discrimina IVA na nota; o cálculo interno mantém-se para o emitente.

### Salvar

Com cabeçalho válido e pelo menos uma linha: **F5** ou **✓ Salvar NF (F5)**. A aplicação volta à lista.

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F3 | Nova nota |
| Ins | Adicionar linha |
| Del | Remover linha selecionada |
| F5 | Salvar nota |
| Esc | Cancelar / voltar à lista |

## Perguntas frequentes

**E se eu escolher o tipo errado (A vs B)?**  
O tipo não pode ser alterado após salvar. É preciso anular a nota e emitir outra (ver política administrativa).

**Posso editar uma nota salva?**  
Não; documentos fiscais são imutáveis. Erro: anular e reemitir.

**Por que Salvar está desabilitado?**  
Só habilita com cliente selecionado e pelo menos um produto nas linhas.

**Outros idiomas:** [English](../../en/user/manual-invoicing.md) · [Español](../../es/user/manual-facturacion.md)
