/**
 * @en Canonical sensitive field names for structured log redaction (Pino paths).
 * @es Nombres canónicos de campos sensibles para redacción en logs estructurados (Pino).
 * @pt-BR Nomes canônicos de campos sensíveis para redação em logs estruturados (Pino).
 */
export const SENSITIVE_LOG_FIELD_NAMES = [
  'password',
  'token',
  'authorization',
  'cookie',
  'session',
  'secret',
  'privateKey',
  'certificate',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'private_key',
  'clientSecret',
  'client_secret',
  'smtpPassword',
  'twilioAuthToken',
  'creditCard',
  'cardNumber',
  'cvv',
  'cvc',
  'cbu',
  'aliasCbu',
  'bearer',
  'jwt',
  'setCookie',
  'x-api-key',
] as const

/**
 * @en Pino `redact.paths` built from {@link SENSITIVE_LOG_FIELD_NAMES} (flat + wildcard + headers).
 * @es Rutas `redact.paths` de Pino derivadas de {@link SENSITIVE_LOG_FIELD_NAMES}.
 * @pt-BR Caminhos `redact.paths` do Pino derivados de {@link SENSITIVE_LOG_FIELD_NAMES}.
 */
export const LOGGER_REDACT_PATHS: string[] = [
  ...SENSITIVE_LOG_FIELD_NAMES,
  ...SENSITIVE_LOG_FIELD_NAMES.map((name) => `*.${name}`),
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'headers.authorization',
  'headers.cookie',
  'headers["x-api-key"]',
]
