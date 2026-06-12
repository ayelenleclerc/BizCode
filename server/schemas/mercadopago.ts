import { z } from 'zod'

export const mercadoPagoConfigUpsertBodySchema = z.object({
  accessToken: z.string().min(1).optional(),
  publicKey: z.string().trim().min(1).max(120),
  webhookSecret: z.union([z.string().min(1), z.literal('')]).optional(),
  sandboxMode: z.boolean().optional(),
  activo: z.boolean().optional(),
})

export const mercadoPagoFacturaEstadoSchema = z.enum([
  'none',
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'expired',
])

export const mercadoPagoFacturaPaymentSchema = z.object({
  estado: mercadoPagoFacturaEstadoSchema,
  preferenceId: z.string().optional(),
  paymentLink: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  pagadoAt: z.string().datetime().optional(),
  amount: z.string().optional(),
  facturaRef: z.string().optional(),
})
