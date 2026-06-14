import { z } from 'zod'

export const mercadoPagoConfigUpsertBodySchema = z.object({
  accessToken: z.string().min(1).optional(),
  publicKey: z.string().trim().min(1).max(120),
  webhookSecret: z.union([z.string().min(1), z.literal('')]).optional(),
  sandboxMode: z.boolean().optional(),
  activo: z.boolean().optional(),
  collectorId: z.string().trim().max(30).optional(),
  externalPosId: z.string().trim().max(60).optional(),
  staticQrData: z.string().trim().max(2000).optional(),
})

export const mercadoPagoPaymentChannelSchema = z.enum(['none', 'link', 'qr'])

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
  channel: mercadoPagoPaymentChannelSchema.optional(),
  preferenceId: z.string().optional(),
  paymentLink: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  pagadoAt: z.string().datetime().optional(),
  amount: z.string().optional(),
  facturaRef: z.string().optional(),
  qrData: z.string().optional(),
  qrImageBase64: z.string().optional(),
  qrExpiresAt: z.string().datetime().optional(),
  qrOrderId: z.string().optional(),
})

export const mercadoPagoStaticQrSchema = z.object({
  qrData: z.string(),
  qrImageBase64: z.string(),
})

export const mercadoPagoWebhookBodySchema = z.object({
  action: z.string().optional(),
  type: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .optional(),
  id: z.union([z.string(), z.number()]).optional(),
  live_mode: z.boolean().optional(),
  user_id: z.union([z.string(), z.number()]).optional(),
})
