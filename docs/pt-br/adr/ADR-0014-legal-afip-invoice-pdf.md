# ADR-0014: PDF legal AFIP e ticket 80 mm (#148)

**Status:** Aceito  
**Data:** 2026-05-29  
**GitHub:** #148

---

## Contexto

O issue #133 entregou PDF mínimo de fatura. O #148 exige layout **fiscal legal** (alinhado RG 4291), **QR** e código de barras **Interleaved 2 of 5** AFIP, cabeçalho da empresa e rota **ticket 80 mm**.

O repositório **não** inclui ferramenta oficial de certificação AFIP; documentado como **alinhado à prática pública AFIP/ARCA**, não certificação completa.

## Decisão

1. **PDF legal:** `GET /api/facturas/:id/pdf` — exige CAE emitido; layout A4 com emitente/receptor, itens, IVA, CAE, QR, código de barras.
2. **Pré-visualização:** `GET /api/facturas/:id/pdf/preview` — marca d'água, **não fiscal**.
3. **Ticket:** `GET /api/facturas/:id/ticket` — PDF 80 mm operacional; sem CAE = **não fiscal**.
4. **Payloads:** funções puras testadas em `afipQrPayload.ts` / `afipBarcodePayload.ts`.
5. **Cabeçalho empresa:** campos mínimos em `ParamEmpresa` (migração conservadora).
6. **Validação:** testes estruturais; verificação manual no portal AFIP pendente.

## Consequências

- **Positivo:** Evolução do #133 sem Puppeteer; lógica em `server/fiscal/ar/`.
- **Negativo:** Certificação RG 4291 completa não evidenciada no repo.

## Referências

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- Issues #133, #148
