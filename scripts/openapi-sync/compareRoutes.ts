import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

export type ExpressRoute = {
  method: HttpMethod
  expressPath: string
  openApiPath: string
  sourceFile: string
  usesListQueryFilter: boolean
  usesListPagination: boolean
}

export type OpenApiOperation = {
  method: HttpMethod
  path: string
  queryParamNames: string[]
}

export type RouteSyncResult = {
  missingInOpenApi: ExpressRoute[]
  queryParamWarnings: string[]
}

const ROUTE_PATTERN =
  /app\.(get|post|put|patch|delete)\(\s*(?:\/\/[^\n]*\n\s*)*['"](\/api\/[^'"]+)['"]/g

/**
 * @en Maps Express `:param` segments to OpenAPI `{param}` paths.
 * @es Mapea segmentos `:param` de Express a rutas `{param}` de OpenAPI.
 * @pt-BR Mapeia segmentos `:param` do Express para caminhos `{param}` do OpenAPI.
 */
export function expressPathToOpenApi(expressPath: string): string {
  return expressPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}')
}

/**
 * @en Collects `/api/*` routes registered via `app.<method>(...)` under `server/`.
 * @es Recolecta rutas `/api/*` registradas con `app.<method>(...)` bajo `server/`.
 * @pt-BR Coleta rotas `/api/*` registradas com `app.<method>(...)` em `server/`.
 */
export function scanExpressApiRoutes(serverRoot: string): ExpressRoute[] {
  const routes: ExpressRoute[] = []
  const seen = new Set<string>()

  for (const filePath of listTypeScriptFiles(serverRoot)) {
    const content = readFileSync(filePath, 'utf8')
    for (const match of content.matchAll(ROUTE_PATTERN)) {
      const method = match[1] as HttpMethod
      const expressPath = match[2]
      const key = `${method.toUpperCase()} ${expressPathToOpenApi(expressPath)}`
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      const handlerSnippet = content.slice(match.index ?? 0, (match.index ?? 0) + 800)
      routes.push({
        method,
        expressPath,
        openApiPath: expressPathToOpenApi(expressPath),
        sourceFile: path.relative(serverRoot, filePath).replace(/\\/g, '/'),
        usesListQueryFilter: handlerSnippet.includes("req.query.q as string"),
        usesListPagination: handlerSnippet.includes('parseListPagination(req)'),
      })
    }
  }

  return routes.sort((a, b) => {
    const left = `${a.openApiPath} ${a.method}`
    const right = `${b.openApiPath} ${b.method}`
    return left.localeCompare(right)
  })
}

/**
 * @en Loads OpenAPI path/method operations from `docs/api/openapi.yaml`.
 * @es Carga operaciones path/método desde `docs/api/openapi.yaml`.
 * @pt-BR Carrega operações path/método de `docs/api/openapi.yaml`.
 */
export function loadOpenApiOperations(specPath: string): OpenApiOperation[] {
  const raw = readFileSync(specPath, 'utf8')
  const doc = parse(raw) as {
    paths?: Record<string, Record<string, { parameters?: Array<{ name?: string; $ref?: string }> }>>
    components?: { parameters?: Record<string, { name?: string }> }
  }

  const parameterNames = doc.components?.parameters ?? {}
  const operations: OpenApiOperation[] = []

  for (const [routePath, pathItem] of Object.entries(doc.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method]
      if (!operation) {
        continue
      }
      const queryParamNames = (operation.parameters ?? [])
        .map((param) => {
          if (param.name) {
            return param.name
          }
          if (param.$ref?.startsWith('#/components/parameters/')) {
            const key = param.$ref.slice('#/components/parameters/'.length)
            return parameterNames[key]?.name
          }
          return undefined
        })
        .filter((name): name is string => typeof name === 'string')
      operations.push({ method, path: routePath, queryParamNames })
    }
  }

  return operations
}

/**
 * @en Compares Express routes with OpenAPI operations and emits list-query warnings.
 * @es Compara rutas Express con operaciones OpenAPI y emite advertencias de query de listado.
 * @pt-BR Compara rotas Express com operações OpenAPI e emite avisos de query de listagem.
 */
export function compareExpressRoutesWithOpenApi(
  expressRoutes: ExpressRoute[],
  openApiOperations: OpenApiOperation[],
): RouteSyncResult {
  const openApiKeys = new Set(
    openApiOperations.map((operation) => `${operation.method.toUpperCase()} ${operation.path}`),
  )
  const missingInOpenApi = expressRoutes.filter(
    (route) => !openApiKeys.has(`${route.method.toUpperCase()} ${route.openApiPath}`),
  )

  const operationByKey = new Map(
    openApiOperations.map((operation) => [
      `${operation.method.toUpperCase()} ${operation.path}`,
      operation,
    ]),
  )

  const queryParamWarnings: string[] = []
  for (const route of expressRoutes) {
    if (route.method !== 'get') {
      continue
    }
    const operation = operationByKey.get(`${route.method.toUpperCase()} ${route.openApiPath}`)
    if (!operation) {
      continue
    }
    const expectedParams: string[] = []
    if (route.usesListQueryFilter) {
      expectedParams.push('q')
    }
    if (route.usesListPagination) {
      expectedParams.push('limit', 'offset')
    }
    for (const paramName of expectedParams) {
      if (!operation.queryParamNames.includes(paramName)) {
        queryParamWarnings.push(
          `WARN: GET ${route.openApiPath} uses list query handling in ${route.sourceFile} but OpenAPI is missing query parameter "${paramName}"`,
        )
      }
    }
  }

  return { missingInOpenApi, queryParamWarnings }
}

function listTypeScriptFiles(rootDir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(rootDir)) {
    const fullPath = path.join(rootDir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath))
      continue
    }
    if (entry.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}
