# Casos de uso (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
| Referência ao produto | BizCode 0.1.0 MVP |

**Ator:** Operador. **Sistema:** BizCode (UI + API + PostgreSQL).

| ID | Nome | Fluxo principal | Evidência |
|----|------|-----------------|-----------|
| CU-01 | Clientes | Listar/buscar → formulário → salvar | `src/pages/clientes/` |
| CU-02 | Produtos | Listar/buscar → formulário → rubro → salvar | `src/pages/articulos/` |
| CU-03 | Faturamento | Lista → nova nota → ítens → salvar | `src/pages/facturacion/` |
| CU-04 | Aparência | Alternar tema; persistência local | `Layout.tsx`, `temas-interface.md` |
| CU-05 | Idioma | Trocar locale | `src/i18n/` |

**Outros idiomas:** [English](../../en/specs/use-cases.md) · [Español](../../es/specs/use-cases.md)
