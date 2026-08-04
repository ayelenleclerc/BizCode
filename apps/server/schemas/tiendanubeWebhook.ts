import { z } from 'zod'

/**
 * @en Tiendanube webhook JSON body (#187).
 * @es Cuerpo JSON del webhook Tiendanube (#187).
 * @pt-BR Corpo JSON do webhook Tiendanube (#187).
 */
export const tiendanubeWebhookBodySchema = z
  .object({
    store_id: z.union([z.string(), z.number()]),
    event: z.string().min(1),
    id: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough()
