import { afterEach, describe, expect, it } from 'vitest'
import { resolveSmtpTransportConfig } from '../../apps/server/config/smtpTransport'

describe('server/config/smtpTransport', () => {
  const prevEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...prevEnv }
  })

  it('resolves smtp URL with explicit port', () => {
    const config = resolveSmtpTransportConfig({
      SMTP_URL: 'smtp://user:pass@mail.example:587',
    })
    expect(config).toEqual({
      host: 'mail.example',
      port: 587,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
      from: 'user',
    })
  })

  it('resolves smtps URL with default port', () => {
    const config = resolveSmtpTransportConfig({
      SMTP_URL: 'smtps://user:pass@mail.example',
    })
    expect(config).toEqual({
      host: 'mail.example',
      port: 465,
      secure: true,
      auth: { user: 'user', pass: 'pass' },
      from: 'user',
    })
  })

  it('prefers SMTP_FROM over URL username', () => {
    const config = resolveSmtpTransportConfig({
      SMTP_URL: 'smtp://user:pass@mail.example:587',
      SMTP_FROM: 'noreply@example.com',
    })
    expect(config?.from).toBe('noreply@example.com')
  })

  it('falls back to legacy SMTP_* variables', () => {
    const config = resolveSmtpTransportConfig({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '465',
      SMTP_USER: 'legacy-user',
      SMTP_PASS: 'legacy-pass',
      SMTP_FROM: 'legacy@example.com',
    })
    expect(config).toEqual({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: { user: 'legacy-user', pass: 'legacy-pass' },
      from: 'legacy@example.com',
    })
  })

  it('returns null when SMTP_URL has no from identity', () => {
    const config = resolveSmtpTransportConfig({
      SMTP_URL: 'smtp://mail.example:587',
    })
    expect(config).toBeNull()
  })
})
