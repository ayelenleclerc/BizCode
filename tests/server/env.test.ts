import { describe, it, expect, afterEach } from 'vitest'
import { initializeAppConfig, loadAppConfig, resetAppConfigCache } from '../../apps/server/config/env'

const validEnv = {
  DATABASE_URL: 'postgresql://bizcode@localhost:5432/bizcode_test',
  JWT_SECRET: 'test-jwt-secret',
  NODE_ENV: 'test',
} as const

describe('server/config/env', () => {
  afterEach(() => {
    resetAppConfigCache()
  })

  it('throws when DATABASE_URL is missing', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        DATABASE_URL: undefined,
      }),
    ).toThrow('Error: DATABASE_URL is required')
  })

  it('throws when JWT_SECRET is missing', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        JWT_SECRET: undefined,
      }),
    ).toThrow('Error: JWT_SECRET is required')
  })

  it('throws when NODE_ENV is missing', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        NODE_ENV: undefined,
      }),
    ).toThrow('Error: NODE_ENV is required')
  })

  it('rejects invalid NODE_ENV values', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        NODE_ENV: 'staging',
      }),
    ).toThrow(/NODE_ENV must be development, test, or production/)
  })

  it('rejects non-positive rate limit overrides', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        HTTP_RATE_LIMIT_PER_MINUTE: '0',
      }),
    ).toThrow(/Number must be greater than 0/)
  })

  it('rejects SMTP_URL without smtp scheme', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        SMTP_URL: 'https://mail.example.test:587',
      }),
    ).toThrow(/SMTP_URL must use smtp: or smtps: scheme/)
  })

  it('accepts optional SMTP_URL, Twilio, log level, and CORS origins', () => {
    const parsed = loadAppConfig({
      ...validEnv,
      SMTP_URL: 'smtp://mail.example.test:587',
      TWILIO_ACCOUNT_SID: 'AC123',
      LOG_LEVEL: 'debug',
      CORS_ORIGINS: 'https://app.example',
    })

    expect(parsed.SMTP_URL).toBe('smtp://mail.example.test:587')
    expect(parsed.TWILIO_ACCOUNT_SID).toBe('AC123')
    expect(parsed.LOG_LEVEL).toBe('debug')
    expect(parsed.CORS_ORIGINS).toBe('https://app.example')
  })

  it('accepts optional JWT_SECRET_PREVIOUS', () => {
    const parsed = loadAppConfig({
      ...validEnv,
      JWT_SECRET_PREVIOUS: 'previous-hmac-secret',
    })
    expect(parsed.JWT_SECRET_PREVIOUS).toBe('previous-hmac-secret')
  })

  it('requires fiscal and MFA encryption keys in production', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        NODE_ENV: 'production',
      }),
    ).toThrow(/BIZCODE_FISCAL_ENCRYPTION_KEY is required in production/)

    expect(() =>
      loadAppConfig({
        ...validEnv,
        NODE_ENV: 'production',
        BIZCODE_FISCAL_ENCRYPTION_KEY: 'fiscal-prod-key',
      }),
    ).toThrow(/BIZCODE_MFA_ENCRYPTION_KEY is required in production/)

    const parsed = loadAppConfig({
      ...validEnv,
      NODE_ENV: 'production',
      BIZCODE_FISCAL_ENCRYPTION_KEY: 'fiscal-prod-key',
      BIZCODE_MFA_ENCRYPTION_KEY: 'mfa-prod-key',
      REDIS_URL: 'redis://127.0.0.1:6379',
    })
    expect(parsed.BIZCODE_FISCAL_ENCRYPTION_KEY).toBe('fiscal-prod-key')
    expect(parsed.BIZCODE_MFA_ENCRYPTION_KEY).toBe('mfa-prod-key')
    expect(parsed.REDIS_URL).toBe('redis://127.0.0.1:6379')
  })

  it('requires REDIS_URL in production (#217)', () => {
    expect(() =>
      loadAppConfig({
        ...validEnv,
        NODE_ENV: 'production',
        BIZCODE_FISCAL_ENCRYPTION_KEY: 'fiscal-prod-key',
        BIZCODE_MFA_ENCRYPTION_KEY: 'mfa-prod-key',
      }),
    ).toThrow(/REDIS_URL is required in production/)
  })

  it('caches config via initializeAppConfig', () => {
    const parsed = initializeAppConfig({
      ...validEnv,
      LOG_LEVEL: 'info',
    })
    expect(parsed.LOG_LEVEL).toBe('info')
  })
})
