import { z } from 'zod'

/**
 * @en Mercado Libre notification body schema (#185).
 * @es Schema del body de notificación Mercado Libre (#185).
 * @pt-BR Schema do body de notificação Mercado Livre (#185).
 */
export const meliWebhookBodySchema = z.object({
  resource: z.string().min(1).max(200),
  topic: z.string().min(1).max(40),
  user_id: z.union([z.string(), z.number()]),
  application_id: z.union([z.string(), z.number()]).optional(),
  attempts: z.number().optional(),
  sent: z.string().optional(),
  received: z.string().optional(),
})

export type MeliWebhookBody = z.infer<typeof meliWebhookBodySchema>
