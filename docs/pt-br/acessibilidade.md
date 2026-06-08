# Acessibilidade

BizCode visa conformidade **WCAG 2.2 nível AA**.

## Política

- Primeiro o teclado: todas as funções sem mouse.
- Compatível com leitor de tela: nomes acessíveis em elementos interativos.
- ESLint `jsx-a11y` no CI com `npm run lint` (`--max-warnings 0`).

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F2 | Focar busca ou filtro ativo |
| F3 | Abrir formulário “Novo” |
| F5 | Salvar formulário |
| Ins | Adicionar linha (fatura) |
| Del | Remover linha selecionada |
| ↑ / ↓ | Navegar linhas ou listas laterais |
| Enter | Abrir linha / confirmar diálogo |
| Esc | Fechar / cancelar |
| Tab | Navegar controles (início, login) |

Telas com atalhos extras exibem cartão **Atalhos** (`KeyboardHint`) abaixo do cabeçalho global.

## Padrões ARIA

Modais: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título.  
Formulários: `label`/`htmlFor`/`id`, erros com `role="alert"` e `aria-describedby`.  
Tabelas: `aria-label`, linhas com `role="row"` e `aria-selected` quando aplicável.

## Mapas (GPS logística)

A vista do planejador em `/logistica/seguimiento` incorpora mapa **Leaflet** (teselas OpenStreetMap). Marcadores e lista lateral usam rótulos i18n; teselas são decorativas para leitores de tela quando a lista está disponível. Priorizar controles por teclado no painel lateral; não usar `aria-pressed` redundante nem `aria-checked` em `<input type="checkbox">` nativo (`logistica/picking`, `logistica/seguimiento`).

## Verificação

- **CI:** `src/App.a11y.test.tsx` com **jest-axe** na rota inicial (API mockada).
- **Manual:** extensão axe DevTools antes do release.

**Outros idiomas:** [English](../en/acessibilidade.md) · [Español](../es/acessibilidade.md)
