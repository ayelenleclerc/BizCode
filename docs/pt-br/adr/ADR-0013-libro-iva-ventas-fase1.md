# ADR-0013: Livro IVA Vendas (Fase 1) — escopo e lacuna Compras

**Status:** Aceito  
**Data:** 2026-05-26  
**GitHub:** #147 (Fase 1)

---

## Contexto

A issue #147 solicita **Livro IVA Vendas** e **Compras** digital (ARCA / RG 3685). No código atual:

- **`Factura`** expõe campos fiscais suficientes para uma primeira exportação de vendas.
- **`OrdenCompra`** não modela comprovantes fiscais de fornecedor. Inferir IVA de `Articulo.condIva` não seria auditável.

Notas de crédito (#146, ADR-0012) devem constar no livro de vendas quando a anulação cair no período.

## Decisão

1. **Escopo Fase 1:** implementar **somente Livro IVA Vendas** end-to-end.
2. **API:** `GET /api/contabilidad/libro-iva-ventas?periodo=YYYY-MM&format=preview|txt|xlsx`.
3. **Módulo:** `finance.ledger`; permissão `reports.financial.read`.
4. **Fonte:** apenas cabeçalho `Factura` persistido.
5. **TXT:** ZIP com `CBTV.txt` + `ALICUOTAS.txt`.
6. **Excel:** revisão interna.
7. **NC / anulações:** conforme ADR-0012 — NC no período + linha tipo **999**.
8. **Fora de escopo:** Livro IVA Compras / CBTU / `OrdenCompra`.
9. **Issue posterior:** modelagem fiscal de compras.
10. **Validação ARCA:** testes estruturais; validador oficial pode ser manual.

## Referências

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- [ADR-0012](ADR-0012-anulacao-fatura-nota-credito.md)
- Issue #147
