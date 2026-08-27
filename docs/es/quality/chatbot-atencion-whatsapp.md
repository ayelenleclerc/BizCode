# Chatbot de atención WhatsApp — MVP (#201)

**Rol del documento:** Guía de calidad del bot de atención inbound por WhatsApp con keywords (Opción A).  
**Issue relacionado:** [#201](https://github.com/ayelenleclerc/BizCode/issues/201)

**No** afirma OpenAI / function calling, Meta Cloud API ni número WhatsApp Business por tenant en base de datos.

## Alcance (MVP)

| Ítem | Evidencia en el repo |
|------|----------------------|
| Persistencia | Prisma `AtencionBotSession` (migración `20260827120000_atencion_bot_session_201`); TTL ~30 min en servicio |
| Intent math | [`atencionBotIntentMath.ts`](../../../apps/server/services/atencionBotIntentMath.ts) — keywords ES/EN/PT-BR |
| Mensajes | [`atencionBotMessages.ts`](../../../apps/server/services/atencionBotMessages.ts) |
| Orquestación | [`AtencionBotService.ts`](../../../apps/server/services/AtencionBotService.ts) |
| Webhook | `POST /api/webhooks/twilio/whatsapp` — firma Twilio; form-urlencoded; respuesta vía `sendWhatsAppMessage` |
| Gate | Inactivo sin `isTwilioConfigured()` **y** módulo `comms.whatsapp`; panel de canales muestra `atencionBot` |
| Intenciones | `saldo`, `estado_pedido`, `pagar`, `unknown` → escalado `atencion_bot_escalation` |
| Fixture AC | `tests/server/atencionBotIntentMath.test.ts`, `tests/server/services/AtencionBotService.test.ts`, `tests/api/twilio-whatsapp-webhook.test.ts` |

## Resolución de cliente / tenant

1. Normalizar `From` a dígitos.
2. Buscar `Cliente.telef` activos coincidentes.
3. 1 match → sesión con `tenantId` + `clienteId`.
4. 0 o muchos → pedir CUIT; el siguiente mensaje resuelve por CUIT (sin mutar ficha).
5. Timeout de sesión → flujo de identidad de nuevo.

El número Twilio es **global** (env). Ambigüedad multi-tenant mitigada con teléfono + CUIT.

## Fuera de alcance / residual

- Opción B OpenAI / NLU
- Meta Cloud API como canal primario
- Número WhatsApp por tenant en DB
- Chat embebido en portal
- ETA de entrega más allá de `Pedido.estado`

## Relacionado

- Outbound: `apps/server/channels.ts`
- Módulo: `comms.whatsapp`
- OpenAPI: `/api/webhooks/twilio/whatsapp`
