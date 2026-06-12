import { z } from 'zod'

export const mercadoPagoConfigUpsertBodySchema = z.object({
  accessToken: z.string().min(1).optional(),
  publicKey: z.string().trim().min(1).max(120),
  webhookSecret: z.union([z.string().min(1), z.literal('')]).optional(),
  sandboxMode: z.boolean().optional(),
  activo: z.boolean().optional(),
})
