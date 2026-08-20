import * as SQLite from 'expo-sqlite'
import {
  ensureDriverOfflineEncryptionKey,
  hasDriverOfflineCryptoMigration,
  markDriverOfflineCryptoMigration,
} from './offlineEncryptionKey'
import { bytesToHex } from './offlineCrypto'
import {
  DRIVER_LEGACY_OFFLINE_DB,
  DRIVER_MMKV_ID_V2,
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
      const key = await ensureDriverOfflineEncryptionKey()
      const keyHex = bytesToHex(key)
      const migrated = await hasDriverOfflineCryptoMigration()
      if (!migrated) {
        try {
          await SQLite.deleteDatabaseAsync(DRIVER_LEGACY_OFFLINE_DB)
        } catch {
          // legacy file may not exist
        }
        resetOfflineDbSingleton()
        resetOfflineMetaStore()
        await markDriverOfflineCryptoMigration()
      }
      bindEncryptedMetaStore(DRIVER_MMKV_ID_V2, keyHex)
      return keyHex
    })()
  }
  return readyPromise
}

/**
 * @en Test helper: clears the ensureOfflineCryptoReady singleton.
 * @es Helper de test: limpia el singleton de ensureOfflineCryptoReady.
 * @pt-BR Helper de teste: limpa o singleton de ensureOfflineCryptoReady.
 */
export function resetOfflineCryptoReadySingleton(): void {
  readyPromise = null
}
