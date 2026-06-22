import 'express-serve-static-core'

declare module 'express-serve-static-core' {
  interface Request {
    /**
     * @en Correlation identifier for logs and tracing (from `X-Request-Id` or generated).
     * @es Identificador de correlación para logs y trazas.
     */
    requestId?: string
  }
}
