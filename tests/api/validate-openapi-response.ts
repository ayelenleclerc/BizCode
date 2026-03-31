import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAPIParser from '@apidevtools/swagger-parser'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { parse as parseYaml } from 'yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SPEC_PATH = path.resolve(__dirname, '../../docs/api/openapi.yaml')

let dereferenced: Record<string, unknown> | null = null

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
})
addFormats(ajv)

async function loadDereferenced() {
  if (!dereferenced) {
    const yamlText = readFileSync(SPEC_PATH, 'utf-8')
    const parsed = parseYaml(yamlText) as Record<string, unknown>
    dereferenced = (await OpenAPIParser.dereference(parsed)) as Record<string, unknown>
  }
  return dereferenced
}

/**
 * Valida un cuerpo JSON contra el schema de respuesta OpenAPI 3.1 (ruta canónica con `{id}`).
 */
export async function assertMatchesOpenApi(
  openApiPath: string,
  method: string,
  statusCode: string,
  body: unknown
): Promise<void> {
  const spec = await loadDereferenced()
  const paths = spec.paths as Record<string, Record<string, unknown>> | undefined
  const pathItem = paths?.[openApiPath]
  const m = method.toLowerCase()
  const op = pathItem?.[m] as Record<string, unknown> | undefined
  if (!op) {
    throw new Error(`No hay operación OpenAPI para ${method.toUpperCase()} ${openApiPath}`)
  }
  const responses = op.responses as
    | Record<string, { content?: Record<string, { schema?: unknown }> }>
    | undefined
  const content = responses?.[statusCode]?.content?.['application/json']?.schema
  if (!content) {
    throw new Error(`No hay schema de respuesta para ${method.toUpperCase()} ${openApiPath} ${statusCode}`)
  }
  const validate = ajv.compile(content as object)
  const ok = validate(body)
  if (!ok) {
    throw new Error(
      `OpenAPI no coincide: ${ajv.errorsText(validate.errors)}\nbody: ${JSON.stringify(body, null, 2)}`
    )
  }
}
