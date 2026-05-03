/**
 * Validates `docs/api/openapi.yaml` resolves and is spec-valid (bundles refs).
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import SwaggerParser from '@apidevtools/swagger-parser'

const dir = path.dirname(fileURLToPath(import.meta.url))
const specPath = path.resolve(dir, '../docs/api/openapi.yaml')

await SwaggerParser.validate(specPath)
console.log('OK: OpenAPI validates', specPath)
