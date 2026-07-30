import { describe, expect, it } from 'vitest'
import {
  decryptBackupBlob,
  encryptBackupBlob,
} from '../../scripts/lib/postgres-backup/crypto'
import {
  buildBackupFileName,
  formatBackupStamp,
  parseBackupFileName,
} from '../../scripts/lib/postgres-backup/naming'
import {
  DEFAULT_RETENTION,
  selectBackupsToKeep,
  selectBackupsToPrune,
} from '../../scripts/lib/postgres-backup/retention'
import { loadPostgresBackupConfig } from '../../scripts/lib/postgres-backup/config'

describe('postgres backup naming', () => {
  it('builds and parses round-trip file names', () => {
    const at = new Date(Date.UTC(2026, 6, 30, 2, 0, 0))
    const name = buildBackupFileName('bizcode_dev', at)
    expect(name).toBe('bizcode-pg-bizcode_dev-20260730T020000Z.sql.gz.enc')
    expect(formatBackupStamp(at)).toBe('20260730T020000Z')
    const parsed = parseBackupFileName(name)
    expect(parsed).not.toBeNull()
    expect(parsed!.dbName).toBe('bizcode_dev')
    expect(parsed!.takenAt.toISOString()).toBe(at.toISOString())
  })

  it('rejects unknown names', () => {
    expect(parseBackupFileName('random.sql')).toBeNull()
  })
})

describe('postgres backup crypto', () => {
  it('encrypts and decrypts gzip-like payloads', () => {
    const key = 'unit-test-backup-key-not-for-prod'
    const plain = Buffer.from('hello-backup-payload')
    const enc = encryptBackupBlob(plain, key)
    expect(enc.subarray(0, 5).toString('ascii')).toBe('BCBK1')
    const out = decryptBackupBlob(enc, key)
    expect(out.equals(plain)).toBe(true)
  })

  it('rejects wrong key and corrupt magic', () => {
    const enc = encryptBackupBlob(Buffer.from('x'), 'key-a')
    expect(() => decryptBackupBlob(enc, 'key-b')).toThrow()
    expect(() => decryptBackupBlob(Buffer.from('not-a-backup'), 'key-a')).toThrow()
  })

  it('rejects empty encryption key', () => {
    expect(() => encryptBackupBlob(Buffer.from('x'), '   ')).toThrow(/BACKUP_ENCRYPTION_KEY/)
  })
})

describe('postgres backup retention', () => {
  it('keeps 7 daily / 4 weekly / 3 monthly union', () => {
    const items = []
    // 40 daily dumps at 02:00 UTC starting 2026-01-01
    for (let i = 0; i < 40; i++) {
      const takenAt = new Date(Date.UTC(2026, 0, 1 + i, 2, 0, 0))
      const fileName = buildBackupFileName('bizcode_dev', takenAt)
      items.push({ fileName, dbName: 'bizcode_dev', takenAt })
    }
    const now = new Date(Date.UTC(2026, 1, 10, 12, 0, 0))
    const keep = selectBackupsToKeep(items, DEFAULT_RETENTION, now)
    // At least daily(7) + weekly + monthly buckets; should be well under 40
    expect(keep.size).toBeGreaterThanOrEqual(7)
    expect(keep.size).toBeLessThan(40)
    const prune = selectBackupsToPrune(items, DEFAULT_RETENTION, now)
    expect(prune.length + keep.size).toBe(items.length)
    for (const p of prune) {
      expect(keep.has(p.fileName)).toBe(false)
    }
  })
})

describe('postgres backup config', () => {
  it('requires BACKUP_ENCRYPTION_KEY', () => {
    expect(() => loadPostgresBackupConfig({})).toThrow(/BACKUP_ENCRYPTION_KEY/)
  })

  it('defaults container and local dir', () => {
    const cfg = loadPostgresBackupConfig({
      BACKUP_ENCRYPTION_KEY: 'secret',
    })
    expect(cfg.dockerContainer).toBe('bizcode_db')
    expect(cfg.postgresDb).toBe('bizcode_dev')
    expect(cfg.postgresUser).toBe('postgres')
    expect(cfg.useDocker).toBe(true)
    expect(cfg.s3Uri).toBeNull()
    expect(cfg.backupDir).toContain('.bizcode-backups')
  })
})
