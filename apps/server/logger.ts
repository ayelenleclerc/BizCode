import pino from 'pino'
import { LOGGER_REDACT_PATHS } from './logRedaction'

export { LOGGER_REDACT_PATHS, SENSITIVE_LOG_FIELD_NAMES } from './logRedaction'

export function createLogger(): pino.Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
    base: undefined,
    redact: {
      paths: LOGGER_REDACT_PATHS,
      censor: '[Redacted]',
      remove: false,
    },
  })
}

/**
 * @en Structured JSON logs; level from `LOG_LEVEL` or inferred from `NODE_ENV`.
 * @es Logs JSON estructurados; nivel desde `LOG_LEVEL`.
 * @pt-BR Logs JSON estruturados; nível via `LOG_LEVEL`.
 */
export const logger = createLogger()
