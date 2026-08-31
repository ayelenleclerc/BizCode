import { z } from 'zod'

/**
 * @en Zod body for public SaaS tenant registration (#180).
 * @es Body Zod para registro público de tenant SaaS (#180).
 * @pt-BR Body Zod para registro público de tenant SaaS (#180).
 */
export const saasRegisterBodySchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  cuit: z.string().trim().min(11).max(14),
  /**
   * @en Tax jurisdiction chosen at registration (#437); the service rejects one this installation does not enable.
   * @es Jurisdicción fiscal elegida en el registro (#437); el servicio rechaza una no habilitada por la instalación.
   * @pt-BR Jurisdição fiscal escolhida no registro (#437); o serviço rejeita uma não habilitada pela instalação.
   */
  jurisdiccionFiscal: z.string().trim().length(2).optional(),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).optional(),
  tenantSlug: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(128),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
})

export type SaasRegisterBody = z.infer<typeof saasRegisterBodySchema>
