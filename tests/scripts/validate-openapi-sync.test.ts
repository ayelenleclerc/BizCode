import { describe, expect, it } from 'vitest'
import {
  compareExpressRoutesWithOpenApi,
  expressPathToOpenApi,
  loadOpenApiOperations,
  scanExpressApiRoutes,
  type ExpressRoute,
  type OpenApiOperation,
} from '../../scripts/openapi-sync/compareRoutes'

describe('openapi sync compareRoutes', () => {
  it('maps Express path params to OpenAPI brace syntax', () => {
    expect(expressPathToOpenApi('/api/clientes/:id')).toBe('/api/clientes/{id}')
    expect(expressPathToOpenApi('/api/notifications/:id/read')).toBe('/api/notifications/{id}/read')
  })

  it('fails comparison when an Express route is missing from OpenAPI', () => {
    const expressRoutes: ExpressRoute[] = [
      {
        method: 'get',
        expressPath: '/api/example',
        openApiPath: '/api/example',
        sourceFile: 'routes/example.ts',
        usesListQueryFilter: false,
        usesListPagination: false,
      },
    ]
    const openApiOperations: OpenApiOperation[] = []

    const result = compareExpressRoutesWithOpenApi(expressRoutes, openApiOperations)
    expect(result.missingInOpenApi).toHaveLength(1)
    expect(result.missingInOpenApi[0]?.openApiPath).toBe('/api/example')
  })

  it('warns when list query params are missing from OpenAPI', () => {
    const expressRoutes: ExpressRoute[] = [
      {
        method: 'get',
        expressPath: '/api/clientes',
        openApiPath: '/api/clientes',
        sourceFile: 'routes/registerClientesRoutes.ts',
        usesListQueryFilter: true,
        usesListPagination: true,
      },
    ]
    const openApiOperations: OpenApiOperation[] = [
      {
        method: 'get',
        path: '/api/clientes',
        queryParamNames: ['limit'],
      },
    ]

    const result = compareExpressRoutesWithOpenApi(expressRoutes, openApiOperations)
    expect(result.missingInOpenApi).toHaveLength(0)
    expect(result.queryParamWarnings.some((warning) => warning.includes('"q"'))).toBe(true)
    expect(result.queryParamWarnings.some((warning) => warning.includes('"offset"'))).toBe(true)
  })

  it('loads OpenAPI operations from the repository spec', () => {
    const operations = loadOpenApiOperations('docs/api/openapi.yaml')
    expect(operations.some((operation) => operation.path === '/api/health' && operation.method === 'get')).toBe(
      true,
    )
  })

  it(
    'discovers Express /api routes from server source',
    () => {
      // @en Repo-wide filesystem scan; grows with each new route module (e.g. #378 fiscal adapters), so it needs more than the 5s default.
      // @es Escaneo del filesystem completo del repo; crece con cada módulo de rutas nuevo (p. ej. adapters fiscales #378), por eso necesita más de los 5s por defecto.
      // @pt-BR Varredura do filesystem completo do repositório; cresce com cada novo módulo de rotas (ex.: adapters fiscais #378), por isso precisa de mais que os 5s padrão.
      const routes = scanExpressApiRoutes('apps/server')
      expect(
        routes.some(
          (route) => route.method === 'get' && route.openApiPath === '/api/dashboard/summary',
        ),
      ).toBe(true)
    },
    15000,
  )
})
