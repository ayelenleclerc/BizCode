import pino from 'pino'

/**
 * @en Structured JSON logs; level from `LOG_LEVEL` or inferred from `NODE_ENV`.
 * @es Logs JSON estructurados; nivel desde `LOG_LEVEL`.
 * @pt-BR Logs JSON estruturados; nível via `LOG_LEVEL`.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  base: undefined,
})
