# Acessibilidade

BizCode visa conformidade **WCAG 2.2 nível AA**.

## Política

- Primeiro o teclado: todas as funções sem mouse.
- Compatível com leitor de tela: nomes acessíveis em elementos interativos.
- ESLint `jsx-a11y` no CI com `npm run lint` (`--max-warnings 0`).

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F2 | Focar busca |
| F3 | Abrir formulário “Novo” |
| F5 | Salvar formulário |
| Ins | Adicionar linha (fatura) |
| Del | Remover linha selecionada |
| ↑ / ↓ | Navegar linhas da tabela |
| Enter | Abrir linha para edição |
| Esc | Fechar / cancelar |

## Padrões ARIA

Modais: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título.  
Formulários: `label`/`htmlFor`/`id`, erros com `role="alert"` e `aria-describedby`.  
Tabelas: `aria-label`, linhas com `role="row"` e `aria-selected` quando aplicável.

## Verificação

- **CI:** `src/App.a11y.test.tsx` com **jest-axe** na rota inicial (API mockada).
- **Manual:** extensão axe DevTools antes do release.

**Outros idiomas:** [English](../en/acessibilidade.md) · [Español](../es/acessibilidade.md)
