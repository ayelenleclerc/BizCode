# ADR-0014: Livro IVA Compras — comprovantes de fornecedor (#306)

**Status:** Aceito  
**Data:** 2026-06-03  
**GitHub:** #306

---

## Contexto

O ADR-0013 entregou o **Livro IVA Vendas** apenas a partir de `Factura`. A issue #306 fecha a lacuna de compras: `OrdenCompra` não modela comprovantes fiscais de fornecedor (tipo A/B/C, líquidos/IVA, CAE).

## Decisão

1. **Modelo:** `ComprobanteCompra` com campos fiscais de cabeçalho alinhados a `Factura` (neto1/2/3, iva1/2, total, tipo, prefijo, numero, proveedorId, ordenCompraId opcional).
2. **Entrada de dados:** formulário em Finanças **Cadastro de comprovante de compra** e `POST /api/comprobantes-compra` (módulo `finance.ledger`, permissão `reports.financial.read`).
3. **Exportação:** `GET /api/contabilidad/libro-iva-compras?periodo=YYYY-MM&format=preview|txt|xlsx`.
4. **TXT:** ZIP com `CBTU.txt` + `ALICUOTAS.txt` (mesmo layout RG 3685 das vendas; contraparte = fornecedor).
5. **Fora de escopo:** Inferir IVA a partir de totais de `OrdenCompra`; notas de crédito de compra / anulação tipo 999 (issue futura).

## Consequências

- **Positivo:** Livro de compras auditável sem dados fictícios de ordens de compra.
- **Negativo:** Registro manual via formulário em Finanças; ampliações futuras (NC compras, scanner) permanecem fora de escopo.
- **Dependências:** Reutiliza `exceljs`, `archiver` e helpers de formato de vendas.

## Referências

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- [ADR-0013](ADR-0013-libro-iva-ventas-fase1.md)
- Issue #306
