/**
 * Migra datos desde Programa_Viejo (DBF) hacia PostgreSQL vía Prisma.
 *
 * Fuentes y mapeo: scripts/MIGRACION_PROGRAMA_VIEJO.md
 *
 * Ejecutar: npm run migrate:dbf
 */
import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { DBFFile } from 'dbffile'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @en Root folder of the legacy Programa_Viejo copy; override with `PROGRAMA_VIEJO_ROOT` if it lives outside the repo.
 * @es Raíz de la copia legacy de Programa_Viejo; usar `PROGRAMA_VIEJO_ROOT` si está fuera del repo.
 * @pt-BR Raiz da cópia legada Programa_Viejo; use `PROGRAMA_VIEJO_ROOT` se estiver fora do repositório.
 */
function programaViejoRoot(): string {
  const fallback = path.join(__dirname, '..', 'Programa_Viejo')
  const fromEnv = process.env.PROGRAMA_VIEJO_ROOT?.trim()
  if (!fromEnv) return fallback
  return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv)
}

const SISTEMA = path.join(
  programaViejoRoot(),
  '16-07-2025 completa',
  'sistema'
)

const ENCODING = 'cp437' as const
const PLACEHOLDER_CLIENT_BASE = 91001
const PLACEHOLDER_CLIENT_COUNT = 10
const ARTICULOS_A_IMPORTAR = 10

const prisma = new PrismaClient()

type Pvar2Agg = {
  importe: number
  costoN: number
  iva: number
  stock: number
}

function ivaToCondIvaArticulo(iva: number): string {
  if (iva >= 20) return '1'
  if (iva >= 10) return '2'
  return '3'
}

function dec2(n: number): string {
  const x = Number.isFinite(n) ? n : 0
  return x.toFixed(2)
}

async function loadPvarDescriptions(): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  const filePath = path.join(SISTEMA, 'PVAR.DBF')
  const dbf = await DBFFile.open(filePath, { readMode: 'loose', encoding: ENCODING })
  if (dbf.recordCount === 0) return map
  for await (const raw of dbf) {
    const r = raw as Record<string, unknown>
    const cod = Math.round(Number(r.CODIG))
    const descr = String(r.DESCR ?? '')
      .trim()
      .slice(0, 30)
    if (cod > 0 && descr.length > 0) map.set(cod, descr)
  }
  return map
}

async function aggregatePvar2ByArtic(): Promise<Map<number, Pvar2Agg>> {
  const byArtic = new Map<number, Pvar2Agg>()
  const filePath = path.join(SISTEMA, 'PVAR2.DBF')
  const dbf = await DBFFile.open(filePath, { readMode: 'loose', encoding: ENCODING })
  for await (const raw of dbf) {
    const r = raw as Record<string, unknown>
    const artic = Number(r.ARTIC)
    if (!Number.isFinite(artic) || artic === 0) continue
    const code = Math.round(artic)
    if (byArtic.has(code)) continue
    const importe = Number(r.IMPORTE)
    const costoN = Number(r.COSTO_N)
    const iva = Number(r.IVA)
    const caja = Number(r.CAJA)
    const unid = Number(r.UNID)
    const stock = Math.min(
      Math.max(0, Math.floor((Number.isFinite(caja) ? caja : 0) + (Number.isFinite(unid) ? unid : 0))),
      2_000_000_000
    )
    byArtic.set(code, {
      importe: Number.isFinite(importe) ? importe : 0,
      costoN: Number.isFinite(costoN) ? costoN : 0,
      iva: Number.isFinite(iva) ? iva : 21,
      stock,
    })
  }
  return byArtic
}

async function listCliIsMetadataOnly(): Promise<boolean> {
  const filePath = path.join(SISTEMA, 'LIST_CLI.DBF')
  const dbf = await DBFFile.open(filePath, { readMode: 'loose', encoding: ENCODING })
  const rows = await dbf.readRecords(1)
  const r = rows[0] as Record<string, unknown> | undefined
  return r != null && Object.prototype.hasOwnProperty.call(r, 'FIELD_NAME')
}

async function ensureRubroGeneral(): Promise<number> {
  const rubro = await prisma.rubro.upsert({
    where: { codigo: 1 },
    create: { codigo: 1, nombre: 'General' },
    update: { nombre: 'General' },
  })
  return rubro.id
}

async function migrateArticulos(rubroId: number, descrFromPvar: Map<number, string>) {
  const agg = await aggregatePvar2ByArtic()
  const codes = [...agg.keys()].sort((a, b) => a - b).slice(0, ARTICULOS_A_IMPORTAR)
  if (codes.length < ARTICULOS_A_IMPORTAR) {
    console.warn(
      `[migrate-from-dbf] Solo hay ${codes.length} códigos ARTIC distintos en PVAR2 (se pidieron ${ARTICULOS_A_IMPORTAR}).`
    )
  }
  const existing = new Set(
    (
      await prisma.articulo.findMany({
        where: { codigo: { in: codes } },
        select: { codigo: true },
      })
    ).map((a) => a.codigo)
  )
  const toCreate = codes
    .filter((c) => !existing.has(c))
    .map((codigo) => {
      const row = agg.get(codigo)!
      const descripcion =
        descrFromPvar.get(codigo) ?? `Artículo ${codigo}`.slice(0, 30)
      const precio = dec2(row.importe)
      const costo = dec2(row.costoN)
      return {
        codigo,
        descripcion,
        rubroId,
        condIva: ivaToCondIvaArticulo(row.iva),
        umedida: 'UN',
        precioLista1: precio,
        precioLista2: precio,
        costo,
        stock: row.stock,
        minimo: 0,
        activo: true,
      }
    })
  if (toCreate.length === 0) {
    console.log('[migrate-from-dbf] Artículos: nada nuevo (códigos ya existían).')
    return
  }
  const result = await prisma.articulo.createMany({ data: toCreate, skipDuplicates: true })
  console.log(`[migrate-from-dbf] Artículos insertados: ${result.count}`)
}

async function migrateClientesPlaceholder() {
  const meta = await listCliIsMetadataOnly()
  if (meta) {
    console.log(
      '[migrate-from-dbf] LIST_CLI.DBF es solo definición de columnas; no hay maestro de clientes en esta copia.'
    )
    console.log(
      `[migrate-from-dbf] Insertando ${PLACEHOLDER_CLIENT_COUNT} clientes placeholder (${PLACEHOLDER_CLIENT_BASE}–${PLACEHOLDER_CLIENT_BASE + PLACEHOLDER_CLIENT_COUNT - 1}).`
    )
  }
  const data = Array.from({ length: PLACEHOLDER_CLIENT_COUNT }, (_, i) => {
    const codigo = PLACEHOLDER_CLIENT_BASE + i
    const n = String(i + 1).padStart(2, '0')
    const rsocial = `Cliente legado ${n}`.slice(0, 30)
    return {
      codigo,
      rsocial,
      condIva: 'R',
      activo: true,
    }
  })
  const codes = data.map((d) => d.codigo)
  const existing = new Set(
    (
      await prisma.cliente.findMany({
        where: { codigo: { in: codes } },
        select: { codigo: true },
      })
    ).map((c) => c.codigo)
  )
  const toCreate = data.filter((d) => !existing.has(d.codigo))
  if (toCreate.length === 0) {
    console.log('[migrate-from-dbf] Clientes placeholder: ya existían.')
    return
  }
  const result = await prisma.cliente.createMany({ data: toCreate, skipDuplicates: true })
  console.log(`[migrate-from-dbf] Clientes insertados: ${result.count}`)
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no está definida. Configura .env en la raíz del proyecto.')
    process.exit(1)
  }
  const rubroId = await ensureRubroGeneral()
  const descrFromPvar = await loadPvarDescriptions()
  await migrateClientesPlaceholder()
  await migrateArticulos(rubroId, descrFromPvar)
  console.log('[migrate-from-dbf] Listo.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
