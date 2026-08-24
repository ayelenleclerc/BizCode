import { z } from 'zod'

/**
 * @en Optional plan override when starting platform SaaS billing (#182).
 * @es Plan opcional al iniciar billing SaaS de plataforma (#182).
 * @pt-BR Plano opcional ao iniciar billing SaaS da plataforma (#182).
 */
export const saasSubscribeBodySchema = z.object({
  planKey: z.string().trim().min(2).max(20).optional(),
})

export type SaasSubscribeBody = z.infer<typeof saasSubscribeBodySchema>

/**
 * @en Platform SaaS billing webhook payload (#182). Mock may include tenantId.
 * @es Payload de webhook de billing SaaS de plataforma (#182). El mock puede incluir tenantId.
 * @pt-BR Payload de webhook de billing SaaS da plataforma (#182). O mock pode incluir tenantId.
 */
export const saasBillingWebhookBodySchema = z.object({
  type: z.string().trim().min(1).max(80),
  data: z
    .object({
      id: z.string().trim().min(1).max(80).optional(),
    })
    .optional(),
  tenantId: z.number().int().positive().optional(),
  outcome: z.enum(['authorized', 'paid', 'failed']).optional(),
  id: z.string().trim().min(1).max(160).optional(),
})

export type SaasBillingWebhookBody = z.infer<typeof saasBillingWebhookBodySchema>
