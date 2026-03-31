/**
 * i18n parity checker — verifies that all locale files have identical key structures.
 * Source of truth: 'es' locale.
 * Run: npx tsx scripts/check-i18n.ts
 * Exit code 1 if any namespace has missing or extra keys in en or pt-BR vs es.
 */
import fs from 'node:fs'
import path from 'node:path'

const LOCALES_DIR = path.resolve('src/locales')
const SOURCE_LANG = 'es'
const TARGET_LANGS = ['en', 'pt-BR']
const NAMESPACES = ['common', 'clientes', 'articulos', 'facturacion']

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

let exitCode = 0

for (const ns of NAMESPACES) {
  const sourcePath = path.join(LOCALES_DIR, SOURCE_LANG, `${ns}.json`)
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf-8')) as Record<string, unknown>
  const sourceKeys = new Set(flatKeys(source))

  for (const lang of TARGET_LANGS) {
    const targetPath = path.join(LOCALES_DIR, lang, `${ns}.json`)
    const target = JSON.parse(fs.readFileSync(targetPath, 'utf-8')) as Record<string, unknown>
    const targetKeys = new Set(flatKeys(target))

    for (const key of sourceKeys) {
      if (!targetKeys.has(key)) {
        console.error(`[${lang}/${ns}] MISSING key: ${key}`)
        exitCode = 1
      }
    }
    for (const key of targetKeys) {
      if (!sourceKeys.has(key)) {
        console.error(`[${lang}/${ns}] EXTRA key: ${key}`)
        exitCode = 1
      }
    }
  }
}

if (exitCode === 0) {
  console.log('✅ i18n parity check PASSED — all locales are in sync')
} else {
  console.error('❌ i18n parity check FAILED — fix the issues above before merging')
}

process.exit(exitCode)
