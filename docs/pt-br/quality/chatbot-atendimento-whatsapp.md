# Chatbot de atendimento WhatsApp — MVP (#201)

**Papel do documento:** Guia de qualidade do bot de atendimento inbound WhatsApp por keywords (Opção A).  
**Issue relacionado:** [#201](https://github.com/ayelenleclerc/BizCode/issues/201)

**Não** afirma OpenAI / function calling, Meta Cloud API nem número WhatsApp Business por tenant no banco.

## Escopo (MVP)

| Item | Evidência no repositório |
|------|--------------------------|
| Persistência | Prisma `AtencionBotSession` (migração `20260827120000_atencion_bot_session_201`); TTL ~30 min no serviço |
| Intent math | [`atencionBotIntentMath.ts`](../../../apps/server/services/atencionBotIntentMath.ts) — keywords ES/EN/PT-BR |
| Mensagens | [`atencionBotMessages.ts`](../../../apps/server/services/atencionBotMessages.ts) |
| Orquestração | [`AtencionBotService.ts`](../../../apps/server/services/AtencionBotService.ts) |
| Webhook | `POST /api/webhooks/twilio/whatsapp` — assinatura Twilio; form-urlencoded; resposta via `sendWhatsAppMessage` |
| Gate | Inativo sem `isTwilioConfigured()` **e** módulo `comms.whatsapp`; painel de canais mostra `atencionBot` |
| Intenções | `saldo`, `estado_pedido`, `pagar`, `unknown` → escalonamento `atencion_bot_escalation` |
| Fixture AC | `tests/server/atencionBotIntentMath.test.ts`, `tests/server/services/AtencionBotService.test.ts`, `tests/api/twilio-whatsapp-webhook.test.ts` |

## Resolução de cliente / tenant

1. Normalizar `From` para dígitos.
2. Buscar `Cliente.telef` ativos coincidentes.
3. 1 match → sessão com `tenantId` + `clienteId`.
4. 0 ou muitos → pedir CUIT; próxima mensagem resolve por CUIT (sem mutar ficha).
5. Timeout de sessão → fluxo de identidade de novo.

O número Twilio é **global** (env). Ambiguidade multi-tenant mitigada com telefone + CUIT.

## Fora de escopo / residual

- Opção B OpenAI / NLU
- Meta Cloud API como canal primário
- Número WhatsApp por tenant no DB
- Chat embutido no portal
- ETA de entrega além de `Pedido.estado`

## Relacionado

- Outbound: `apps/server/channels.ts`
- Módulo: `comms.whatsapp`
- OpenAPI: `/api/webhooks/twilio/whatsapp`
