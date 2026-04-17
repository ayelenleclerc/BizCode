# User Manual: Customers

## Access

Click **Clientes** in the left sidebar, or navigate with arrow keys and press Enter.

## Customer List

When you open the section you will see the customer table with: Code, Business Name, CUIT, VAT Condition, Phone, and Active status.

**Search:** Type in the search field (or press **F2** to focus). The list filters automatically by business name or CUIT.

**Navigate:** Use **↑** and **↓** to move between rows. The selected row is highlighted in blue.

**Open for editing:** With a row selected, press **Enter**; or double-click the row.

## Create a New Customer

1. Press **F3** or click **➕ Nuevo**.
2. The new-customer form opens.
3. Fill in the fields and press **F5** or **Save**.

### Form Fields

| Field | Required | Description |
|---|---|---|
| Código | Yes | Positive integer. Cannot be changed after creation. |
| Razón Social | Yes | Legal name or full name. Minimum 3 characters. |
| Nombre Fantasía | No | Trade name (if different from business name). |
| CUIT | No | Argentine tax ID. Format: `XX-XXXXXXXX-X`. The system validates the check digit. |
| Condición IVA | Yes | Customer tax regime (see table below). |
| Domicilio | No | Street and number. |
| Localidad | No | City or locality. |
| Código Postal | No | Postal code (up to 8 characters). |
| Teléfono | No | Phone number. |
| Email | No | Valid email address. |
| Activo | Yes | Uncheck to deactivate the customer without deleting records. |

### VAT Condition

| Value | Description | Invoice to issue |
|---|---|---|
| **RI** | Registered VAT taxpayer | Factura A (VAT itemized) |
| **Mono** | Monotributo | Factura B (VAT included) |
| **CF** | End consumer | Factura B (VAT included) |
| **Exento** | VAT exempt | Factura A or B without VAT |

### CUIT Validation

The system automatically verifies the CUIT. If the check digit does not match, you will see **"CUIT inválido"**. You may enter the CUIT with or without hyphens (`20123456786` or `20-12345678-6`).

## Edit a Customer

1. Select the customer in the table.
2. Press **Enter** or double-click.
3. Change the fields (Code is not editable).
4. Press **F5** or **Save**.

## Deactivate a Customer

Edit the customer and uncheck **Activo**. The customer becomes inactive but historical invoices are kept.

## Bulk import (CSV)

Users with customer management permission can load many records from a **UTF-8 CSV** file.

1. On the list screen, open **Import CSV** (or the equivalent control).
2. **Download the template** from the same dialog: it includes the required header row and one example row.
3. Do not change the header row column names or order. Save the file as `.csv` (UTF-8).
4. Attach the file and confirm. The system reports how many rows were created and, if any rows failed validation or duplicates, **per-row** errors (data row numbers start after the header; row 1 is the header).

**Duplicate policy:** if a customer **code** already exists in the database, or is repeated within the same file, that row is rejected and not inserted.

**Limits:** maximum file size and maximum number of data rows are enforced by the API (see OpenAPI at `/api-docs`). Oversized uploads return an error.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| F2 | Focus search field |
| F3 | Open new customer form |
| F5 | Save form |
| ↑ / ↓ | Navigate table rows |
| Enter | Open selected customer |
| Esc | Close form or import dialog without saving |
