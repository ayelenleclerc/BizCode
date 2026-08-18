# User Manual: Collections (Payments)

## Access

Click **Cobros** in the left sidebar, or open a customer and use **Register payment** / recent payments links when available.

Requires permission **`sales.create`** to register a payment.

## Payment list

The list shows date, customer, amount, and reference. Use filters:

| Filter | Description |
|--------|-------------|
| Customer | Numeric customer id (optional). |
| From / To | Date range (`YYYY-MM-DD`). |
| Filter | Applies filters and reloads the list. |

Deep link: `/cobros?clienteId=<id>` opens the list with that customer filter and the new-payment dialog.

## Register a payment

1. Click **New payment** (visible with `sales.create`).
2. Select **Customer**, **Date**, **Amount** (required, greater than zero).
3. Optionally choose **Payment method**, **Reference**, and **Note**.
4. Click **Save**.

On success the customer balance decreases by the payment amount. If the customer has at least one active invoice, **payment score** may change per server rules (see OpenAPI `POST /api/cobros`).

### Errors

| Situation | Behaviour |
|-----------|-----------|
| Customer suspended or inactive | HTTP 422; message in UI |
| Missing permission | Control hidden or API 403 |
| Invalid amount | Validation before submit |

## App Driver collections (#162)

Drivers do **not** receive `sales.create`. From App Driver, **Collect** on a route stop opens `/cobros?clienteId=` and calls the same `POST /api/cobros` with `orders.deliver.confirm`, header `x-bizcode-channel: field`, and a customer on today's `mi-reparto`. Invoice checkboxes only set the default amount (no ReciboCobro imputation). WhatsApp is a local `wa.me` link with editable text (no Twilio, no PDF). The payment appears in this web list immediately (`reports.operational.read`).

## API reference

Contract: [`docs/api/openapi.yaml`](../../api/openapi.yaml) — tag `cobros`. Swagger UI: `/api-docs` when the API is running.

**Other languages:** [Español](../../es/user/manual-cobros.md) · [Português](../../pt-br/user/manual-cobrancas.md)
