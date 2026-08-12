import { offlineMeta } from '../offline/meta'

export type ScanQtyMode = 'ask' | 'addOne'

const KEY_SCAN_ADD_ONE = 'seller.scanAddOne'

/**
 * @en Reads scan qty mode: ask quantity (default) vs add one per scan (#255).
 * @es Lee modo de cantidad: pedir cantidad (default) vs sumar 1 por escaneo (#255).
 * @pt-BR Lê modo de quantidade: pedir quantidade (padrão) vs somar 1 por leitura (#255).
 */
export function getScanQtyPreference(): ScanQtyMode {
  return offlineMeta.getString(KEY_SCAN_ADD_ONE) === '1' ? 'addOne' : 'ask'
}

/**
 * @en Persists scan qty mode (#255).
 * @es Persiste modo de cantidad al escanear (#255).
 * @pt-BR Persiste modo de quantidade ao escanear (#255).
 */
export function setScanQtyPreference(mode: ScanQtyMode): void {
  offlineMeta.setString(KEY_SCAN_ADD_ONE, mode === 'addOne' ? '1' : '0')
}
