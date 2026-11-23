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
    const parsed = parseYaml(yamlText)
    // Parse YAML in-process so swagger-parser does not resolve the spec path as an HTTP URL
    // (vitest/jsdom sets location to localhost:3000 and breaks contract tests in CI).
    dereferenced = (await OpenAPIParser.dereference(
      parsed as Parameters<typeof OpenAPIParser.dereference>[0],
    )) as Record<string, unknown>
  }
  return dereferenced
}

export type AssertMatchesOpenApiOptions = {
  /**
   * @en Media type under the response `content` map (default: `application/json`, else `text/csv` if present).
   * @es Media type bajo el mapa `content` de la respuesta (por defecto: `application/json`, si no `text/csv` si existe).
   * @pt-BR Media type no mapa `content` da resposta (padrão: `application/json`, senão `text/csv` se existir).
   */
  contentType?: string
}

/**
 * @en Validates a response body against the OpenAPI 3.1 response schema (canonical path with `{id}`).
 * @es Valida un cuerpo de respuesta contra el schema OpenAPI 3.1 (ruta canónica con `{id}`).
 * @pt-BR Valida um corpo de resposta contra o schema OpenAPI 3.1 (rota canônica com `{id}`).
 */
export async function assertMatchesOpenApi(
  openApiPath: string,
  method: string,
  statusCode: string,
  body: unknown,
  options?: AssertMatchesOpenApiOptions,
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
  const contentMap = responses?.[statusCode]?.content
  const contentType =
    options?.contentType ??
    (contentMap?.['application/json'] ? 'application/json' : undefined) ??
    (contentMap?.['text/csv'] ? 'text/csv' : undefined)
  const content = contentType ? contentMap?.[contentType]?.schema : undefined
  if (!content || !contentType) {
    throw new Error(`No hay schema de respuesta para ${method.toUpperCase()} ${openApiPath} ${statusCode}`)
  }
  const validate = ajv.compile(content as object)
  const bodyForError: unknown = body
  const ok = validate(body)
  if (!ok) {
    const bodyPreview =
      typeof bodyForError === 'string'
        ? bodyForError.slice(0, 500)
        : JSON.stringify(bodyForError, null, 2)
    throw new Error(
      `OpenAPI no coincide (${contentType}): ${ajv.errorsText(validate.errors)}\nbody: ${bodyPreview}`,
    )
  }
}
