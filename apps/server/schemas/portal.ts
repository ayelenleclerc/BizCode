import { z } from 'zod'

export const portalMagicLinkBodySchema = z.object({
  email: z.string().trim().min(1).max(50).email(),
})

export const portalConfigUpdateBodySchema = z.object({
  enabled: z.boolean().optional(),
  showPedidos: z.boolean().optional(),
  logoUrl: z.string().max(255).nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
  footerText: z.string().max(500).nullable().optional(),
})

export const portalFacturaEstadoSchema = z.enum(['pagada', 'pendiente', 'vencida'])
