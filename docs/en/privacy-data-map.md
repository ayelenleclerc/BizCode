# Personal Data Map

## Data Inventory

| Field | Entity | Type | Purpose | Legal basis | Retention |
|---|---|---|---|---|---|
| `rsocial` (business name) | Customer | Company or person name | Identification on invoices | Contractual obligation | Duration of business relationship + 10 years (tax prescription) |
| `cuit` (CUIT/CUIL) | Customer | Argentine tax ID | Legal invoicing; ARCA compliance | Legal obligation (Res. Gral. 1415, ARCA) | 10 years |
| `email` | Customer | Email address | Commercial communications (optional) | Consent | Until deletion requested |
| `domicilio`, `localidad`, `cpost` | Customer | Postal address | Tax address on invoices | Contractual obligation | 10 years |
| `telef` | Customer | Phone number | Commercial contact (optional) | Consent | Until deletion requested |

## Non-Personal Data

| Field | Entity | Note |
|---|---|---|
| `descripcion`, `codigo`, prices | Product | Product data, not personal |
| Invoice amounts, VAT | Invoice | Business financial data, not personal |

## Data Subject Rights

Under Argentine Law 25.326 (Personal Data Protection), data subjects have the right to:

- **Access:** Obtain information about stored data.
- **Rectification:** Correct inaccurate data.
- **Erasure:** Request deletion of data not required for legal obligations.

To exercise these rights, the application operator must provide a contact mechanism.

## Data Security

- Data is stored locally in PostgreSQL, accessible only from the operator's machine.
- Personal data is not transmitted to external servers.
- Database access is controlled via credentials in `.env` (not versioned).

## Compliance Notes

- The application does not send data to third parties or use cloud services.
- No cookies or tracking are implemented.
- For use on a corporate LAN, the operator is responsible for server access control.
