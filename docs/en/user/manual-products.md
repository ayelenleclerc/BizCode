# User Manual: Products (Artículos)

## Access

Click **Artículos** in the left sidebar.

## Product List

Shows: Code, Description, Category (Rubro), VAT, List Price 1, List Price 2, Stock, and Active.

**Search:** Type in the search field (**F2**) to filter by code or description.

**Navigate:** Use **↑** / **↓** to move between rows.

## Create a New Product

1. Press **F3** or click **➕ Nuevo**.
2. Complete the form.
3. Press **F5** or **Save**.

### Form Fields

| Field | Required | Description |
|---|---|---|
| Código | Yes | Product code (not editable after creation). |
| Descripción | Yes | Product name. Minimum 3, maximum 30 characters. |
| Rubro | Yes | Product category. Must exist in the rubro catalogue. |
| U. Medida | Yes | Unit of sale (e.g. U, kg, l, cj). Minimum 2 characters. |
| Condición IVA | Yes | Product VAT rate (see table below). |
| P. Lista 1 | Yes | Main list price. Positive number with up to 2 decimals. |
| P. Lista 2 | Yes | Alternate list price (e.g. wholesale). |
| Costo | Yes | Cost (for margin calculation). |
| Stock | Yes | Inventory quantity. Non-negative integer. |
| Mínimo | Yes | Minimum stock for replenishment alerts. |
| Activo | Yes | Uncheck to stop selling the product. |

### Product VAT Condition

| Value | Rate |
|---|---|
| **21%** | Standard VAT (most goods) |
| **10.5%** | Reduced VAT (basic food, books, medicines) |
| **Exento** | No VAT (exports, educational services, etc.) |

The product’s VAT condition determines the applicable rate. The customer’s VAT condition determines how VAT is shown on the invoice (itemized on Factura A, or included on Factura B).

## Edit a Product

1. Select the product in the table.
2. Press **Enter** or double-click.
3. Change the fields and press **F5**.

## Categories (Rubros)

Rubros classify products (e.g. "Tools", "Electronics"). Users with **product management** permission can **import rubros from CSV** on this screen (“Import rubros CSV”): download the template, keep the header row unchanged, use UTF-8, and review the summary of rows created or skipped.

## CSV import (rubros and products)

With **products.manage**:

- **Rubros:** fixed columns `codigo`, `nombre`. `.csv` file; max file size and row count are shown in the import dialog. Rows are skipped if the category code already exists in the database or is duplicated in the same file.
- **Products:** columns as in the template; **`rubroCodigo`** must match the **numeric code** of an existing rubro. The same duplicate policy applies to the product `codigo` (within the file and in the database).

**Esc** closes the import dialog when it is open; otherwise it closes the product form.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| F2 | Focus search field |
| F3 | Open new product form |
| F5 | Save form |
| ↑ / ↓ | Navigate table rows |
| Enter | Open selected product |
| Esc | Close CSV import dialog, or close form without saving |
