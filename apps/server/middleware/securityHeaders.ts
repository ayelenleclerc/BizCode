import type { RequestHandler } from 'express'
import helmet from 'helmet'

/**
 * @en Helmet options for the REST API (Swagger UI at `/api-docs` needs inline assets).
 * @es Opciones Helmet para la API REST (Swagger UI en `/api-docs` requiere assets inline).
 * @pt-BR Opções Helmet para a API REST (Swagger UI em `/api-docs` precisa de assets inline).
 */
export function getSecurityHeadersMiddleware(): RequestHandler {
  const isProduction = process.env.NODE_ENV === 'production'
  return helmet({
    frameguard: { action: 'deny' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: false,
    hsts: isProduction
      ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
      : false,
  })
}
