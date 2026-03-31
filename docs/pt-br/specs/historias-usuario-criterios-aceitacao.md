# Histórias de usuário e critérios de aceitação (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
| Referência ao produto | BizCode 0.1.0 MVP |

## HU-01 — Clientes

- **História:** Como operador, quero gerir clientes para manter o cadastro.
- **Critérios:** Busca e gravação coerentes com a API (`GET/POST/PUT /api/clientes`).
- **Evidência:** `src/pages/clientes/`.

## HU-02 — Produtos

- **História:** Como operador, quero gerir produtos com rubro e alíquota para faturamento.
- **Critérios:** Rubro selecionado vem de `GET /api/rubros`.
- **Evidência:** `src/pages/articulos/`.

## HU-03 — Faturas

- **História:** Como operador, quero emitir notas com ítens.
- **Critérios:** Sem cliente/ítens, salvar conforme regras da UI (manual de usuário).
- **Evidência:** `src/pages/facturacion/`, `GET/POST /api/facturas`.

## HU-04 — Tema

- **História:** Como operador, quero tema claro/escuro persistente.
- **Critérios:** Comportamento conforme [temas-interface.md](../temas-interface.md).
- **Evidência:** `Layout.tsx`.

## HU-05 — Idioma

- **História:** Como operador, quero ES/EN/PT-BR na interface.
- **Critérios:** Sem literais fora de `t()`.
- **Evidência:** [estrategia-i18n.md](../estrategia-i18n.md).

**Outros idiomas:** [English](../../en/specs/user-stories-and-acceptance.md) · [Español](../../es/specs/user-stories-and-acceptance.md)
