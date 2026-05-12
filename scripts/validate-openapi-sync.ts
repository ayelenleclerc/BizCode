/**
 * @en Fails when Express `/api/*` routes are missing from `docs/api/openapi.yaml`.
 * @es Falla cuando rutas Express `/api/*` no están en `docs/api/openapi.yaml`.
 * @pt-BR Falha quando rotas Express `/api/*` não estão em `docs/api/openapi.yaml`.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  compareExpressRoutesWithOpenApi,
  loadOpenApiOperations,
  scanExpressApiRoutes,
} from './openapi-sync/compareRoutes'

const dir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dir, '..')
const serverRoot = path.join(repoRoot, 'server')
const specPath = path.join(repoRoot, 'docs', 'api', 'openapi.yaml')

const expressRoutes = scanExpressApiRoutes(serverRoot)
const openApiOperations = loadOpenApiOperations(specPath)
const { missingInOpenApi, queryParamWarnings } = compareExpressRoutesWithOpenApi(
  expressRoutes,
  openApiOperations,
)

for (const warning of queryParamWarnings) {
  console.warn(warning)
}

if (missingInOpenApi.length > 0) {
  console.error('OpenAPI sync failed: undocumented Express routes:')
  for (const route of missingInOpenApi) {
    console.error(
      `  - ${route.method.toUpperCase()} ${route.openApiPath} (${route.sourceFile}, Express path ${route.expressPath})`,
    )
  }
  process.exit(1)
}

console.log(`OK: ${expressRoutes.length} Express /api routes are documented in ${specPath}`)
