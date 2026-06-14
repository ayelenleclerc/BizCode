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
  'refunded',
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

export const mercadoPagoReconciliationEntrySchema = z.object({
  mpPaymentId: z.string(),
  transactionAmount: z.string(),
  currencyId: z.string(),
  paymentDate: z.string().datetime(),
  payerName: z.string().nullable(),
  payerEmail: z.string().nullable(),
  payerIdentification: z.string().nullable(),
  preferenceId: z.string().nullable(),
  externalReference: z.string().nullable(),
  createdAt: z.string().datetime(),
})

export const mercadoPagoReconcileBodySchema = z.object({
  mpPaymentId: z.string().trim().min(1).max(60),
  facturaId: z.number().int().positive(),
})

export const mercadoPagoIgnoreBodySchema = z.object({
  mpPaymentId: z.string().trim().min(1).max(60),
})

export const mercadoPagoReconciliationJobSummarySchema = z.object({
  processed: z.number().int().nonnegative(),
  autoReconciled: z.number().int().nonnegative(),
  queued: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
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

export const mercadoPagoRefundBodySchema = z.object({
  motivo: z.string().trim().min(10).max(500),
  monto: z.number().positive().optional(),
})

export const mercadoPagoRefundEntrySchema = z.object({
  id: z.number().int().positive(),
  facturaId: z.number().int().positive(),
  mpPaymentId: z.string(),
  mpRefundId: z.string().nullable(),
  monto: z.string(),
  motivo: z.string(),
  estado: z.enum(['iniciado', 'procesando', 'completado', 'fallido']),
  notaCreditoId: z.number().int().positive().nullable(),
  reciboCobroId: z.number().int().positive().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const mercadoPagoRefundStatusSchema = z.object({
  originalPaymentAmount: z.string(),
  refundableBalance: z.string(),
  refunds: z.array(mercadoPagoRefundEntrySchema),
})

export const mercadoPagoChargebackEntrySchema = z.object({
  id: z.number().int().positive(),
  mpChargebackId: z.string(),
  mpPaymentId: z.string().nullable(),
  facturaId: z.number().int().positive().nullable(),
  estado: z.enum(['pendiente', 'resuelto', 'ignorado']),
  notifiedAt: z.string().datetime().nullable(),
  resolvedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})

export const mercadoPagoChargebackPatchBodySchema = z.object({
  estado: z.enum(['resuelto', 'ignorado']),
})
