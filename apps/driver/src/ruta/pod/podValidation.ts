import type { RepartoItemPodInput } from '@bizcode/types'

export type DeliveredPodFields = Omit<RepartoItemPodInput, 'outcome' | 'motivoNoEntrega'>

export type PodSaveErrorKey = 'signatureRequired' | 'photoTooLarge' | 'firmaTooLarge' | 'save'

/**
 * @en Client gate: delivery confirm needs a recipient name and a non-empty signature.
 * @es Barrera de cliente: confirmar entrega exige nombre del receptor y firma no vacía.
 * @pt-BR Barreira do cliente: confirmar entrega exige nome do receptor e assinatura não vazia.
 */
export function canConfirmDelivered(receptorNombre: string, firmaDataUrl: string | null): boolean {
  return receptorNombre.trim().length > 0 && firmaDataUrl != null && firmaDataUrl.length > 0
}

/**
 * @en Maps API/media errors to i18n keys in the driver `pod` namespace.
 * @es Mapea errores de API/media a claves i18n del namespace `pod` de Driver.
 * @pt-BR Mapeia erros de API/mídia para chaves i18n do namespace `pod` do Driver.
 */
export function mapPodSaveError(err: unknown): PodSaveErrorKey {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('POD_FIRMA_REQUIRED') || msg.includes('firmaBase64')) return 'signatureRequired'
  if (msg.includes('POD_FIRMA_TOO_LARGE')) return 'firmaTooLarge'
  if (msg.includes('POD_FOTO_TOO_LARGE')) return 'photoTooLarge'
  return 'save'
}

/**
 * @en Builds PUT body for a delivered stop (firma already size-checked).
 * @es Arma el body PUT de una parada entregada (firma ya validada en tamaño).
 * @pt-BR Monta o body PUT de uma parada entregue (assinatura já validada em tamanho).
 */
export function buildDeliveredPodInput(input: {
  receptorNombre: string
  receptorDni: string
  firmaBase64: string
  fotoBase64: string | null
  notasEntrega: string
}): DeliveredPodFields {
  return {
    receptorNombre: input.receptorNombre.trim(),
    receptorDni: input.receptorDni.trim() || null,
    firmaBase64: input.firmaBase64,
    fotoBase64: input.fotoBase64,
    notasEntrega: input.notasEntrega.trim() || null,
  }
}
