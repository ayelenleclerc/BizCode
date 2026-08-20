import * as SQLite from 'expo-sqlite'
import {
  ensureSellerOfflineEncryptionKey,
  hasSellerOfflineCryptoMigration,
  markSellerOfflineCryptoMigration,
} from './offlineEncryptionKey'
import { bytesToHex } from './offlineCrypto'
import {
  SELLER_LEGACY_OFFLINE_DB,
  SELLER_MMKV_ID_V2,
} from './offlineStorageIds'
import { resetOfflineDbSingleton } from '../offline/db'
import { resetOfflineMetaStore, bindEncryptedMetaStore } from '../offline/meta'

let readyPromise: Promise<string> | null = null

/**
 * @en One-shot wipe of legacy cleartext offline DB/MMKV, then AES key + encrypted MMKV id (#220). Sync before upgrade to avoid losing outbox.
 * @es Wipe one-shot de DB/MMKV offline en claro, luego clave AES + id MMKV cifrado (#220). Sincronizar antes de actualizar para no perder outbox.
 * @pt-BR Wipe one-shot do DB/MMKV offline em claro; depois chave AES + id MMKV cifrado (#220). Sincronize antes de atualizar para não perder outbox.
 */
export async function ensureOfflineCryptoReady(): Promise<string> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const key = await ensureSellerOfflineEncryptionKey()
      const keyHex = bytesToHex(key)
      const migrated = await hasSellerOfflineCryptoMigration()
      if (!migrated) {
        try {
          await SQLite.deleteDatabaseAsync(SELLER_LEGACY_OFFLINE_DB)
        } catch {
          // legacy file may not exist
        }
        resetOfflineDbSingleton()
        resetOfflineMetaStore()
        await markSellerOfflineCryptoMigration()
      }
      bindEncryptedMetaStore(SELLER_MMKV_ID_V2, keyHex)
      return keyHex
    })()
  }
  return readyPromise
}

export function resetOfflineCryptoReadySingleton(): void {
  readyPromise = null
}
