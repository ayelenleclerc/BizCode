import { describe, expect, it } from 'vitest'
import pino from 'pino'
import { LOGGER_REDACT_PATHS } from '../../server/logger'

describe('logger redaction policy', () => {
  it('includes mandatory sensitive keys', () => {
    const required = [
      '*.password',
      '*.token',
      '*.authorization',
      '*.cookie',
      '*.session',
      '*.secret',
      '*.privateKey',
      '*.certificate',
      'req.headers.authorization',
      'req.headers.cookie',
    ]
    for (const key of required) {
      expect(LOGGER_REDACT_PATHS).toContain(key)
    }
  })

  it('redacts sensitive values when serializing JSON logs', () => {
    let output = ''
    const sink = {
      write(chunk: string | Uint8Array): void {
        output += String(chunk)
      },
    }
    const testLogger = pino(
      {
        level: 'info',
        base: undefined,
        redact: { paths: LOGGER_REDACT_PATHS, censor: '[Redacted]', remove: false },
      },
      sink as pino.DestinationStream,
    )

    testLogger.info({
      password: 'secret-123',
      token: 'abc',
      req: {
        headers: {
          authorization: 'Bearer real-token',
          cookie: 'session=real',
        },
      },
    })

    expect(output).toContain('[Redacted]')
    expect(output).not.toContain('secret-123')
    expect(output).not.toContain('real-token')
    expect(output).not.toContain('session=real')
  })
})
