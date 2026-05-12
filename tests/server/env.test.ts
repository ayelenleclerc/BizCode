import { describe, it, expect, afterEach } from 'vitest'
import { initializeAppConfig, loadAppConfig, resetAppConfigCache } from '../../server/config/env'

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

  it('caches config via initializeAppConfig', () => {
    const parsed = initializeAppConfig({
      ...validEnv,
      LOG_LEVEL: 'info',
    })
    expect(parsed.LOG_LEVEL).toBe('info')
  })
})
