# Customer-care WhatsApp chatbot — MVP (#201)

**Document role:** Product quality guide for keyword-based WhatsApp inbound care bot (Opción A).  
**Related issue:** [#201](https://github.com/ayelenleclerc/BizCode/issues/201)

Does **not** claim OpenAI / function calling, Meta Cloud API, or a per-tenant WhatsApp Business number in the database.

## Scope (MVP)

| Item | Evidence in repo |
|------|------------------|
| Persistence | Prisma `AtencionBotSession` (migration `20260827120000_atencion_bot_session_201`); TTL ~30 min enforced in service |
| Intent math | [`atencionBotIntentMath.ts`](../../../apps/server/services/atencionBotIntentMath.ts) — keywords ES/EN/PT-BR |
| Messages | [`atencionBotMessages.ts`](../../../apps/server/services/atencionBotMessages.ts) |
| Orchestration | [`AtencionBotService.ts`](../../../apps/server/services/AtencionBotService.ts) |
| Webhook | `POST /api/webhooks/twilio/whatsapp` — Twilio signature; form-urlencoded; outbound via `sendWhatsAppMessage` |
| Gate | Bot inactive unless `isTwilioConfigured()` **and** tenant module `comms.whatsapp`; channels panel shows `atencionBot` |
| Intents | `saldo` (SellerAlert credit snapshot), `estado_pedido` (latest `Pedido.estado`), `pagar` (`PaymentService.createPaymentForInvoice`), `unknown` → escalate `atencion_bot_escalation` to owner/manager |
| AC fixture | `tests/server/atencionBotIntentMath.test.ts`, `tests/server/services/AtencionBotService.test.ts`, `tests/api/twilio-whatsapp-webhook.test.ts` |

## Client / tenant resolution

1. Normalize Twilio `From` to digits.
2. Match active `Cliente.telef` (exact normalized or shared last 10 digits).
3. One match → bind session `tenantId` + `clienteId`.
4. Zero or many matches → ask CUIT; next message resolves by CUIT digits (does not mutate customer phone on the ficha).
5. Session timeout → treat as new identity flow.

Twilio number is **global** (env). Multi-tenant ambiguity is mitigated by phone + CUIT; document residual risk when the same phone/CUIT exists in several tenants.

## Out of scope / residual

- Opción B OpenAI / NLU / function calling
- Meta Cloud API as primary channel
- WhatsApp Business number stored per tenant
- Embedded portal chat widget
- Delivery ETA beyond evidenced `Pedido.estado`

## Related

- Outbound WhatsApp: `apps/server/channels.ts`
- Module flag: `comms.whatsapp`
- OpenAPI: `docs/api/openapi.yaml` path `/api/webhooks/twilio/whatsapp`
