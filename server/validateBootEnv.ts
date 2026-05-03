/**
 * @en Startup validation for required env (no invented keys; only what bootstrap needs).
 * @es Validación de arranque para variables requeridas.
 */
export function validateBootEnv(): void {
  const db = process.env.DATABASE_URL?.trim()
  if (!db || db.length === 0) {
    throw new Error('DATABASE_URL must be set (non-empty) to start the API server')
  }

  const rl = process.env.HTTP_RATE_LIMIT_PER_MINUTE
  if (rl !== undefined && rl.trim() !== '') {
    const n = Number.parseInt(rl, 10)
    if (!Number.isFinite(n) || n < 1) {
      throw new Error('HTTP_RATE_LIMIT_PER_MINUTE must be a positive integer when set')
    }
  }
}
