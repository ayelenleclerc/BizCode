import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'
import { bytesToHex, hexToBytes, setActiveOfflineKeyBytes } from './offlineCrypto'

export const DRIVER_OFFLINE_KEY_STORE = 'bizcode_driver_offline_aes_v1'
export const DRIVER_OFFLINE_CRYPTO_FLAG = 'bizcode_driver_offline_crypto_v1'

/**
 * @en Loads or creates a 32-byte AES key in SecureStore and caches it for seal/open (#220).
 * @es Carga o crea una clave AES de 32 bytes en SecureStore y la cachea para seal/open (#220).
 * @pt-BR Carrega ou cria uma chave AES de 32 bytes no SecureStore e a coloca em cache para seal/open (#220).
 */
export async function ensureDriverOfflineEncryptionKey(): Promise<Uint8Array> {
  let hex = await SecureStore.getItemAsync(DRIVER_OFFLINE_KEY_STORE)
  if (!hex || hex.length !== 64) {
    const random = await Crypto.getRandomBytesAsync(32)
    hex = bytesToHex(random)
    await SecureStore.setItemAsync(DRIVER_OFFLINE_KEY_STORE, hex)
  }
  const key = hexToBytes(hex)
  setActiveOfflineKeyBytes(key)
  return key
}

/**
 * @en Returns true when the one-shot encrypted offline storage migration already ran.
 * @es True si ya corrió la migración one-shot a almacenamiento offline cifrado.
 * @pt-BR True se a migração one-shot para storage offline cifrado já rodou.
 */
export async function hasDriverOfflineCryptoMigration(): Promise<boolean> {
  const flag = await SecureStore.getItemAsync(DRIVER_OFFLINE_CRYPTO_FLAG)
  return flag === '1'
}

export async function markDriverOfflineCryptoMigration(): Promise<void> {
  await SecureStore.setItemAsync(DRIVER_OFFLINE_CRYPTO_FLAG, '1')
}
