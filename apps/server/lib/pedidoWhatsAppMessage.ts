/**
 * @en Server re-export of the pure WhatsApp order message builder (#265).
 * @es Reexport del builder puro de mensaje WhatsApp de pedido (#265).
 * @pt-BR Reexport do builder puro de mensagem WhatsApp de pedido (#265).
 */
export {
  WHATSAPP_MESSAGE_MAX,
  DEFAULT_SELLER_WHATSAPP_TEMPLATES,
  normalizePhoneForWhatsApp,
  resolveSellerWhatsAppLocale,
  formatWhatsAppMoney,
  formatWhatsAppFecha,
  formatPedidoWhatsAppItemLine,
  buildPedidoWhatsAppMessage,
  buildWaMeUrl,
  buildPedidoWhatsAppShare,
} from '@bizcode/types'
export type {
  PedidoWhatsAppItem,
  SellerWhatsAppLocale,
  WhatsAppCanal,
  WhatsAppSendInput,
  WhatsAppSendResult,
  WhatsAppSharePreview,
} from '@bizcode/types'
