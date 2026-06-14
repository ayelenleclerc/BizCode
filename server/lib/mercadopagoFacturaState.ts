import type { Factura } from '@prisma/client'

export type MercadoPagoFacturaEstado =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired'

export type MercadoPagoPaymentChannel = 'none' | 'link' | 'qr'

export type MercadoPagoFacturaPaymentDto = {
  estado: MercadoPagoFacturaEstado
  channel?: MercadoPagoPaymentChannel
  preferenceId?: string
  paymentLink?: string
  expiresAt?: string
  pagadoAt?: string
  amount?: string
  facturaRef?: string
  qrData?: string
  qrImageBase64?: string
  qrExpiresAt?: string
  qrOrderId?: string
}

export function isActiveQr(
  factura: Pick<Factura, 'mpQrData' | 'mpQrExpiresAt' | 'mpEstado'>,
  now = new Date(),
): boolean {
  return (
    factura.mpEstado === 'pending' &&
    Boolean(factura.mpQrData) &&
    factura.mpQrExpiresAt != null &&
    factura.mpQrExpiresAt.getTime() > now.getTime()
  )
}

export function isActivePreference(
  factura: Pick<Factura, 'mpPreferenceId' | 'mpPreferenceExpiresAt' | 'mpEstado'>,
  now = new Date(),
): boolean {
  return (
    factura.mpEstado === 'pending' &&
    Boolean(factura.mpPreferenceId) &&
    factura.mpPreferenceExpiresAt != null &&
    factura.mpPreferenceExpiresAt.getTime() > now.getTime()
  )
}

export function deriveMercadoPagoEstado(
  mpEstado: string | null | undefined,
  preferenceExpiresAt: Date | null | undefined,
  qrExpiresAt: Date | null | undefined,
  now = new Date(),
): MercadoPagoFacturaEstado {
  if (!mpEstado) return 'none'
  if (mpEstado === 'approved') return 'approved'
  if (mpEstado === 'rejected') return 'rejected'
  if (mpEstado === 'cancelled') return 'cancelled'
  if (mpEstado === 'pending') {
    const preferenceActive =
      preferenceExpiresAt != null && preferenceExpiresAt.getTime() > now.getTime()
    const qrActive = qrExpiresAt != null && qrExpiresAt.getTime() > now.getTime()
    if (preferenceActive || qrActive) return 'pending'
    if (preferenceExpiresAt != null || qrExpiresAt != null) return 'expired'
    return 'pending'
  }
  return 'none'
}

export function deriveMercadoPagoChannel(
  factura: Pick<
    Factura,
    | 'mpPreferenceId'
    | 'mpPaymentLink'
    | 'mpPreferenceExpiresAt'
    | 'mpQrData'
    | 'mpQrOrderId'
    | 'mpQrExpiresAt'
    | 'mpEstado'
  >,
  estado: MercadoPagoFacturaEstado,
  now = new Date(),
): MercadoPagoPaymentChannel {
  if (estado === 'approved') {
    if (factura.mpQrOrderId != null || factura.mpQrData) return 'qr'
    if (factura.mpPreferenceId) return 'link'
    return 'none'
  }
  if (isActiveQr(factura, now)) return 'qr'
  if (isActivePreference(factura, now)) return 'link'
  return 'none'
}
