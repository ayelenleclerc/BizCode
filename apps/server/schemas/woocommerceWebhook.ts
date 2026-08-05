import { z } from 'zod'

/**
 * @en WooCommerce order webhook JSON body — WooCommerce posts the order resource directly, unlike
 *   Tiendanube's `{store_id, event, id}` envelope (#188).
 * @es Cuerpo JSON del webhook de orden WooCommerce — WooCommerce publica el recurso orden directo, a
 *   diferencia del envelope `{store_id, event, id}` de Tiendanube (#188).
 * @pt-BR Corpo JSON do webhook de pedido WooCommerce — o WooCommerce publica o recurso pedido direto,
 *   diferente do envelope `{store_id, event, id}` da Tiendanube (#188).
 */
export const woocommerceWebhookBodySchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    status: z.string().optional(),
  })
  .passthrough()
