import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'
import { bytesToHex, hexToBytes, setActiveOfflineKeyBytes } from './offlineCrypto'

export const SELLER_OFFLINE_KEY_STORE = 'bizcode_seller_offline_aes_v1'
export const SELLER_OFFLINE_CRYPTO_FLAG = 'bizcode_seller_offline_crypto_v1'

/**
 * @en Loads or creates a 32-byte AES key in SecureStore and caches it for seal/open (#220).
 * @es Carga o crea una clave AES de 32 bytes en SecureStore y la cachea para seal/open (#220).
 * @pt-BR Carrega ou cria uma chave AES de 32 bytes no SecureStore e a coloca em cache para seal/open (#220).
 */
export async function ensureSellerOfflineEncryptionKey(): Promise<Uint8Array> {
  let hex = await SecureStore.getItemAsync(SELLER_OFFLINE_KEY_STORE)
  if (!hex || hex.length !== 64) {
    const random = await Crypto.getRandomBytesAsync(32)
    hex = bytesToHex(random)
    await SecureStore.setItemAsync(SELLER_OFFLINE_KEY_STORE, hex)
  }
  const key = hexToBytes(hex)
  setActiveOfflineKeyBytes(key)
  return key
}

export async function hasSellerOfflineCryptoMigration(): Promise<boolean> {
  const flag = await SecureStore.getItemAsync(SELLER_OFFLINE_CRYPTO_FLAG)
  return flag === '1'
}

export async function markSellerOfflineCryptoMigration(): Promise<void> {
  await SecureStore.setItemAsync(SELLER_OFFLINE_CRYPTO_FLAG, '1')
}
