import { z } from 'zod'

const REQUIRED_ENV_KEYS = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'] as const

const optionalNonEmptyString = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined
    }
    if (typeof value !== 'string') {
      return value
    }
    const trimmed = value.trim()
    return trimmed.length === 0 ? undefined : trimmed
  },
  z.string().min(1).optional(),
)

const optionalPositiveInt = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined
    }
    if (typeof value !== 'string') {
      return value
    }
    const trimmed = value.trim()
    return trimmed.length === 0 ? undefined : trimmed
  },
  z.coerce.number().int().positive().optional(),
)

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().trim().min(1, 'JWT_SECRET is required'),
  JWT_SECRET_PREVIOUS: optionalNonEmptyString,
  NODE_ENV: z.enum(['development', 'test', 'production'], {
    errorMap: () => ({ message: 'NODE_ENV must be development, test, or production' }),
  }),
  REDIS_URL: optionalNonEmptyString,
  BIZCODE_FISCAL_ENCRYPTION_KEY: optionalNonEmptyString,
  BIZCODE_MFA_ENCRYPTION_KEY: optionalNonEmptyString,
  SMTP_URL: z.preprocess(
    (value) => {
      if (value === undefined || value === null) {
        return undefined
      }
      if (typeof value !== 'string') {
        return value
      }
      const trimmed = value.trim()
      return trimmed.length === 0 ? undefined : trimmed
    },
    z
      .string()
      .url('SMTP_URL must be a valid URL')
      .refine((url) => url.startsWith('smtp:') || url.startsWith('smtps:'), {
        message: 'SMTP_URL must use smtp: or smtps: scheme',
      })
      .optional(),
  ),
  TWILIO_ACCOUNT_SID: optionalNonEmptyString,
  LOG_LEVEL: optionalNonEmptyString,
  CORS_ORIGINS: optionalNonEmptyString,
  HTTP_RATE_LIMIT_PER_MINUTE: optionalPositiveInt,
  HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE: optionalPositiveInt,
  HTTP_RATE_LIMIT_AUTH_PER_MINUTE: optionalPositiveInt,
  HTTP_RATE_LIMIT_LOGIN_PER_15_MIN: optionalPositiveInt,
  HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR: optionalPositiveInt,
  HTTP_RATE_LIMIT_REPORTS_PER_HOUR: optionalPositiveInt,
  HTTP_RATE_LIMIT_IMPORT_PER_HOUR: optionalPositiveInt,
  TRUST_PROXY: optionalNonEmptyString,
  WEBHOOK_IP_ALLOWLIST: optionalNonEmptyString,
})

export type AppConfig = z.infer<typeof envSchema>

let cachedConfig: AppConfig | null = null

/**
 * @en Formats Zod env validation failures into a single startup error message.
 * @es Formatea fallos Zod de variables de entorno en un mensaje de arranque único.
 * @pt-BR Formata falhas Zod de variáveis de ambiente em uma mensagem única de inicialização.
 */
export function formatEnvValidationError(error: z.ZodError): string {
  const messages = new Set<string>()

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string') {
      messages.add(issue.message)
      continue
    }

    if (
      (REQUIRED_ENV_KEYS as readonly string[]).includes(key) &&
      (issue.code === 'invalid_type' || issue.code === 'too_small')
    ) {
      messages.add(`${key} is required`)
      continue
    }

    if (issue.code === 'invalid_enum_value' && key === 'NODE_ENV') {
      messages.add('NODE_ENV must be development, test, or production')
      continue
    }

    messages.add(issue.message)
  }

  return `Error: ${[...messages].join('; ')}`
}

/**
 * @en Parses and validates process env for API bootstrap; throws on invalid config.
 * @es Parsea y valida el entorno de proceso para el arranque de la API; lanza si la config es inválida.
 * @pt-BR Faz parse e valida o ambiente do processo para o bootstrap da API; lança se a config for inválida.
 */
export function loadAppConfig(
  raw: Record<string, string | undefined> = process.env,
): AppConfig {
  const result = envSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(formatEnvValidationError(result.error))
  }
  const data = result.data
  if (data.NODE_ENV === 'production') {
    const missing: string[] = []
    if (!data.BIZCODE_FISCAL_ENCRYPTION_KEY) {
      missing.push('BIZCODE_FISCAL_ENCRYPTION_KEY is required in production')
    }
    if (!data.BIZCODE_MFA_ENCRYPTION_KEY) {
      missing.push('BIZCODE_MFA_ENCRYPTION_KEY is required in production')
    }
    if (!data.REDIS_URL) {
      missing.push('REDIS_URL is required in production')
    }
    if (missing.length > 0) {
      throw new Error(`Error: ${missing.join('; ')}`)
    }
  }
  return data
}

/**
 * @en Cached validated config for the API process (set by {@link initializeAppConfig}).
 * @es Config validada en caché para el proceso API (asignada por {@link initializeAppConfig}).
 * @pt-BR Config validada em cache para o processo da API (definida por {@link initializeAppConfig}).
 */
export function getAppConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadAppConfig()
  }
  return cachedConfig
}

/**
 * @en Validates env once and stores {@link getAppConfig} for the running process.
 * @es Valida el entorno una vez y guarda {@link getAppConfig} para el proceso en ejecución.
 * @pt-BR Valida o ambiente uma vez e armazena {@link getAppConfig} para o processo em execução.
 */
export function initializeAppConfig(
  raw: Record<string, string | undefined> = process.env,
): AppConfig {
  cachedConfig = loadAppConfig(raw)
  return cachedConfig
}

/** @en Clears cached config (test harness only). */
export function resetAppConfigCache(): void {
  cachedConfig = null
}

/** @en Validated env snapshot after {@link initializeAppConfig}. */
export const config = new Proxy({} as AppConfig, {
  get(_target, property) {
    return getAppConfig()[property as keyof AppConfig]
  },
})
