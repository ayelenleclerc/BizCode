# User Manual: Invoicing

## Access

Click **Facturación** in the left sidebar.

## Invoice List

Shows all issued invoices with: Date, Type (A/B), Number, Customer, Net, VAT, Total, and Status (Active/Void).

**View detail:** Click an invoice to expand line items and VAT breakdown.

## PDF and printing (AFIP CAE module)

When **`billing.arca_cae`** is enabled and you have **`reports.operational.read`**:

| Action | API | Notes |
|--------|-----|--------|
| Preview PDF | `GET /api/facturas/{id}/pdf/preview` | Watermarked, **non-fiscal** (no CAE required). |
| Legal PDF | `GET /api/facturas/{id}/pdf` | Requires **issued CAE**; fiscal layout with QR and barcode ([ADR-0014](../adr/ADR-0014-legal-arca-invoice-pdf.md)). |
| 80mm ticket | `GET /api/facturas/{id}/ticket` | Counter ticket; **non-fiscal** if CAE is not issued. |

In invoice detail: **Preview PDF**, **Print / preview** (modal with download fallback), **Download PDF** (legal), and **80mm ticket**. Configure issuer header fields under **Settings → Company** (`condicionIva`, gross income, activity start date).

Official AFIP portal validation of QR/barcode may still be required in homologación.

## Voiding an invoice (credit notes module)

When tenant module **`billing.credit_notes`** is enabled and your role has **`sales.cancel`**, open an **active** invoice detail and use **Void invoice**. You must enter a **reason** with at least **10** characters (server validation). The operation calls `PUT /api/facturas/{id}/void`; the system records a **credit note** linked to the original invoice (see [ADR-0012](../adr/ADR-0012-invoice-void-credit-note.md)). Listing credit notes in the app: **Finance** page, same module (API `GET /api/notas-credito`).

## Issue a New Invoice

1. Press **F3** or click **➕ Nueva Factura**.
2. Complete the header.
3. Add line items.
4. Press **F5** or **✓ Guardar Factura**.

### Invoice Header

| Field | Required | Description |
|---|---|---|
| Tipo | Yes | **Factura A** (RI customer) or **Factura B** (CF, Mono). |
| Prefijo | No | Point of sale (up to 4 characters, e.g. `0001`). |
| Número | Yes | Voucher number. |
| Fecha | Yes | Issue date (default: today). |
| Cliente | Yes | Select the customer from the dropdown. |

### Invoice Type Selection

- **Factura A**: For customers with VAT condition **RI**. VAT is shown itemized. The customer can claim input VAT.
- **Factura B**: For **CF**, **Mono**, or **Exento** customers. VAT is included in the price (not itemized).

### Add Line Items

1. Press **Ins** or **➕ Agregar Ítem** to add a line.
2. On each line select the **Artículo** from the dropdown. Price is filled automatically from List Price 1.
3. Enter **Cantidad** (default: 1).
4. Change **Precio** if needed.
5. Enter **Descuento %** (0 = no discount).
6. **Subtotal** is calculated automatically: `Qty × Price × (1 - Dscto%/100)`.

To **remove** a line: click the line and press **Del**.

### Automatic Totals

Totals update when any line or the customer changes:

| Column | Description |
|---|---|
| **Neto 21%** | Sum of subtotals for 21% VAT items (excluding VAT) |
| **Neto 10.5%** | Sum for 10.5% items |
| **Neto Exento** | Sum for exempt items |
| **IVA** | Total VAT (21% + 10.5%). For CF/Mono: still calculated internally |
| **TOTAL** | Net total + VAT total |

**Note:** For **CF** and **Mono** customers, the total includes VAT but Factura B does not itemize VAT. VAT is still computed internally for the issuer’s records.

### Save the Invoice

With header complete and at least one line:
- Press **F5** or **✓ Guardar Factura (F5)**.
- The invoice is saved and the app returns to the list.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| F3 | Open new invoice form |
| Ins | Add line item |
| Del | Remove selected line |
| F5 | Save invoice |
| Esc | Cancel and return to list |

## FAQ

**What if I chose the wrong type (A vs B)?**  
The invoice type cannot be changed after save. You must void the invoice and issue a new one. Contact the administrator to void vouchers.

**Can I edit a saved invoice?**  
No. Invoices are immutable tax documents. If there is an error, void and re-issue.

**Why is Save disabled?**  
Save is enabled only when there is at least one line and a customer selected.
