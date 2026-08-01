/**
 * @en Maps free-text carrier statuses into BizCode `estadoEnvio` (#193).
 * @es Normaliza estados de texto del carrier a `estadoEnvio` (#193).
 * @pt-BR Normaliza status textuais do carrier para `estadoEnvio` (#193).
 */
export function mapCarrierStatusToEstadoEnvio(
  raw: string | undefined | null,
): 'pending' | 'in_transit' | 'delivered' | 'returned' {
  const s = (raw ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  if (!s.trim()) return 'pending'
  if (
    /entregad|delivered|entregue|entrega exitosa|constancia de entrega/.test(s)
  ) {
    return 'delivered'
  }
  if (/devol|return|reenvi|devuelto/.test(s)) return 'returned'
  if (
    /transito|transit|camino|en ruta|distribucion|sucursal|impres|admitid|despach|retirado|en viaje/.test(
      s,
    )
  ) {
    return 'in_transit'
  }
  if (/pendiente|pending|cread|informad|label|etiqueta|prealert/.test(s)) {
    return 'pending'
  }
  return 'in_transit'
}
