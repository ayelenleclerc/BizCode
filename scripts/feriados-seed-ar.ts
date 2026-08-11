/**
 * @en Seeds AR national holidays per active tenant from fixture (optional live refresh).
 * @es Siembra feriados nacionales AR por tenant activo desde fixture (refresh opcional en vivo).
 * @pt-BR Semeia feriados nacionais AR por tenant ativo a partir do fixture (refresh opcional ao vivo).
 *
 * Usage: npm run feriados:seed-ar -- --years=2025,2026,2027
 * Optional: --live to try https://nolaborables.com.ar (soft-fail to fixture on error/rate-limit).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { FeriadoService } from '../apps/server/services/FeriadoService'
import type { FeriadoTipo } from '@bizcode/types'

type FixtureItem = {
  fecha: string
  nombre: string
  tipo?: FeriadoTipo
  provincia?: string | null
}

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseYears(args: string[]): number[] {
  const yearsArg = args.find((a) => a.startsWith('--years='))
  const raw = yearsArg?.slice('--years='.length) ?? '2025,2026,2027'
  return raw
    .split(',')
    .map((y) => parseInt(y.trim(), 10))
    .filter((y) => Number.isInteger(y) && y >= 2000 && y <= 2100)
}

async function fetchLive(years: number[]): Promise<FixtureItem[] | null> {
  const out: FixtureItem[] = []
  try {
    for (const year of years) {
      const url = `https://nolaborables.com.ar/api/v2/feriados/${year}`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) {
        console.warn(`[feriados:seed-ar] live HTTP ${res.status} for ${year}; using fixture`)
        return null
      }
      const data = (await res.json()) as Array<{ dia: number; mes: number; motivo: string }>
      for (const item of data) {
        const mes = String(item.mes).padStart(2, '0')
        const dia = String(item.dia).padStart(2, '0')
        out.push({
          fecha: `${year}-${mes}-${dia}`,
          nombre: item.motivo,
          tipo: 'nacional',
        })
      }
    }
    return out
  } catch (err: unknown) {
    console.warn('[feriados:seed-ar] live fetch failed (soft):', err instanceof Error ? err.message : err)
    return null
  }
}

function loadFixture(years: number[]): FixtureItem[] {
  const path = join(__dirname, 'data', 'feriados-ar-2025-2027.json')
  const all = JSON.parse(readFileSync(path, 'utf8')) as FixtureItem[]
  const yearSet = new Set(years)
  return all.filter((item) => yearSet.has(parseInt(item.fecha.slice(0, 4), 10)))
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const years = parseYears(args)
  const useLive = args.includes('--live')
  const prisma = new PrismaClient()
  const service = new FeriadoService(prisma)

  try {
    let items: FixtureItem[] | null = null
    if (useLive) {
      items = await fetchLive(years)
    }
    if (!items) {
      items = loadFixture(years)
      console.log(`[feriados:seed-ar] using fixture (${items.length} rows for years ${years.join(',')})`)
    } else {
      console.log(`[feriados:seed-ar] using live API (${items.length} rows)`)
    }

    const tenants = await prisma.tenant.findMany({
      where: { active: true },
      select: { id: true, slug: true },
    })
    if (tenants.length === 0) {
      console.warn('[feriados:seed-ar] no active tenants')
      return
    }

    for (const tenant of tenants) {
      const result = await service.upsertMany(tenant.id, items)
      console.log(
        `[feriados:seed-ar] tenant=${tenant.slug} created=${result.created} skipped=${result.skipped}`,
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
