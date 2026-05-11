/**
 * @en Startup validation for required env (no invented keys; only what bootstrap needs).
 * @es Validación de arranque para variables requeridas.
 */
export function validateBootEnv(): void {
  const db = process.env.DATABASE_URL?.trim()
  if (!db || db.length === 0) {
    throw new Error('DATABASE_URL must be set (non-empty) to start the API server')
  }

  const rateLimitKeys = [
    'HTTP_RATE_LIMIT_PER_MINUTE',
    'HTTP_RATE_LIMIT_AUTH_PER_MINUTE',
    'HTTP_RATE_LIMIT_IMPORT_PER_HOUR',
  ] as const

  for (const key of rateLimitKeys) {
    const raw = process.env[key]
    if (raw !== undefined && raw.trim() !== '') {
      const n = Number.parseInt(raw, 10)
      if (!Number.isFinite(n) || n < 1) {
        throw new Error(`${key} must be a positive integer when set`)
      }
    }
  }
}
