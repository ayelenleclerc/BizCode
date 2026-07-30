# Personal Data Map

## Data Inventory

| Field | Entity | Type | Purpose | Legal basis | Retention |
|---|---|---|---|---|---|
| `rsocial` (business name) | Customer | Company or person name | Identification on invoices | Contractual obligation | Duration of business relationship + 10 years (tax prescription) |
| `cuit` (CUIT/CUIL) | Customer | Argentine tax ID | Legal invoicing; ARCA compliance | Legal obligation (Res. Gral. 1415, ARCA) | 10 years |
| `email` | Customer | Email address | Commercial communications (optional) | Consent | Until deletion requested |
| `domicilio`, `localidad`, `cpost` | Customer | Postal address | Tax address on invoices; delivery address text in logistics UI (no coordinates stored on `Cliente`) | Contractual obligation | 10 years |
| `telef` | Customer | Phone number | Commercial contact (optional) | Consent | Until deletion requested |
| `receptorNombre`, `receptorDni` | RepartoItem (POD) | Recipient name / optional ID | Proof of delivery when module `logistics.pod` is enabled | Contractual obligation / legitimate interest in delivery proof | While the route and audit policy require |
| `podMedia` (signature / photo JSON) | RepartoItem (POD) | Biometric-like image data (signature); optional package photo | Proof of delivery | Contractual obligation | Same as related `Reparto` / tenant retention policy |
| `lat`, `lng`, `recordedAt` | RepartoUbicacion | Driver geolocation sample | Live route tracking when module `logistics.gps` is enabled; linked to driver via `Reparto.choferId` | Legitimate interest / operational safety (operator configures module) | **7 days** (application purge on each record + optional `npm run reparto-ubicacion:purge`) |
| `username`, role | AppUser (driver / staff) | Account identifiers | Authentication and logistics assignment | Contractual obligation | Account lifetime |

## Non-Personal Data

| Field | Entity | Note |
|---|---|---|
| `descripcion`, `codigo`, prices | Product | Product data, not personal |
| Invoice amounts, VAT | Invoice | Business financial data, not personal |
| Route state, sequence, delivery outcomes | Reparto / RepartoItem | Operational logistics metadata |

## Third parties and network (module-dependent)

| Flow | When | What leaves the operator environment |
|---|---|---|
| **Own API** | Always (SaaS or LAN deployment) | Session and business data between browser/desktop client and the operator's BizCode server |
| **Browser Geolocation API** | Driver on `/logistica/repartos/chofer` with `logistics.gps` and permission granted | Device obtains coordinates; client posts `{ lat, lng }` to **`POST /api/repartos/{id}/ubicacion`** only (optional if denied; POD unaffected) |
| **OpenStreetMap tile CDN** | Planner on `/logistica/seguimiento` with `logistics.gps` | Map tiles requested by the browser (standard Leaflet + OSM usage; no customer PII in tile URLs) |
| **AFIP / email providers** | Only when fiscal or notification integrations are configured | See [security.md](security.md) and module catalog |

Core business tables remain in **PostgreSQL** under operator control. Enabling `logistics.gps` does **not** store customer map coordinates (no `lat`/`lng` on `Cliente` in the current schema).

## Data Subject Rights

Under Argentine Law 25.326 (Personal Data Protection), data subjects have the right to:

- **Access:** Obtain information about stored data — via `GET /api/clientes/:id/exportar-datos` (owner / super_admin) or operator contact.
- **Rectification:** Correct inaccurate data — via customer update (`PUT /api/clientes/:id`).
- **Erasure:** Request deletion of data not required for legal obligations — via irreversible anonymization (`POST /api/clientes/:id/anonimizar`); fiscal documents are retained.
- **Objection (marketing):** BizCode has no marketing engine; operators must not use customer data for campaigns without their own legal basis.

Public policy page: `/privacidad`. Operational detail: [privacy-and-data-subject-rights.md](quality/privacy-and-data-subject-rights.md).

Commercial contact fields (email/phone) may be retained for up to **5 years** when no longer needed, or until anonymization. Fiscal records: **10 years**.

## Data Security

- Data is stored in PostgreSQL; access is restricted to the deployment environment (local machine, corporate LAN, or hosted SaaS per operator policy).
- Database access is controlled via credentials in `.env` (not versioned).
- POD media and GPS samples are tenant-scoped rows; purge jobs and route closure should be considered in the operator's retention policy.

## Compliance Notes

- Third-party map tiles and optional browser geolocation apply only when the **`logistics.gps`** module is enabled and the user grants browser location permission.
- No advertising cookies or cross-site tracking are implemented in the product UI.
- For corporate LAN or SaaS, the operator is responsible for server access control and DPA with subprocessors if applicable.
