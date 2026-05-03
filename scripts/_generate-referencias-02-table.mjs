/**
 * Genera solo la tabla markdown (pipe) con columna Grupo heurística para docs/referencias/02.
 * Uso: node scripts/_generate-referencias-02-table.mjs docs/referencias/exports/inventario-dbf-volcado.md
 *
 * La heurística es orientativa; revisar en 06-modulos-funcionales-legacy.md.
 */
import fs from 'node:fs'

function base(name) {
  return name.trim().replace(/\.dbf$/i, '').toUpperCase()
}

function grupo(name) {
  const b = base(name)
  if (b.startsWith('LIST_') || b.startsWith('STRU_') || b === 'ART_LST' || b === 'TABLA_V') return 'A'
  if (b === 'BORRAR' || b === 'ANULADOS' || b === 'REIMPRE' || b === 'LOCK_ABM') return 'E'
  if (
    b === 'CLIENTES' ||
    b === 'CCTE_V' ||
    b === 'CAJAS' ||
    b === 'CHEQUES' ||
    b === 'BANCOS' ||
    b === 'HIST_CLI' ||
    b === 'ACCESOS' ||
    b === 'CLAVES' ||
    b === 'CIE_CAJA' ||
    b === 'PROCESOS' ||
    b === 'DEP_CLI'
  )
    return 'C'
  if (/^CLAS\d{2}$/.test(b) || b.startsWith('PVAR') || b === 'ARTIC' || b === 'RUBRO') return 'B'
  if (
    b === 'NOV_ART' ||
    b === 'NOV_CLI' ||
    b === 'COLORES' ||
    b === 'ESCALAS' ||
    b === 'PARAM1_V' ||
    b === 'PARAM2_V' ||
    b === 'PARIDAD' ||
    b === 'MONEDA' ||
    b === 'PCIAS' ||
    b === 'TIPONEG' ||
    b === 'ZONAS' ||
    b === 'LUGAR' ||
    b === 'CONCEPTO' ||
    b === 'FPAGO' ||
    b === 'PUESTOS' ||
    b === 'VEND' ||
    b === 'PROVE' ||
    b === 'ST1_UV' ||
    b === 'ST2_UV' ||
    b === 'CTA_GS' ||
    b === 'SDO_INI' ||
    b === 'GASTOS' ||
    b === 'TCALLES'
  )
    return 'B'
  if (
    b === 'FACT' ||
    b === 'REMITOS' ||
    b.startsWith('PEDIDO') ||
    b === 'DET_COMP' ||
    b === 'ENCAB' ||
    b === 'ENCAB_TK' ||
    b === 'COMIS' ||
    b === 'PAGOS' ||
    b === 'IVA_V' ||
    b === 'MOV_STK' ||
    b.startsWith('REPART') ||
    b === 'UREM' ||
    b === 'UV' ||
    b === 'PMANUAL'
  )
    return 'D'
  return '?'
}

const path = process.argv[2] || 'docs/referencias/exports/inventario-dbf-volcado.md'
const raw = fs.readFileSync(path, 'utf8')
const lines = raw.split(/\r?\n/)
let out = `| Archivo | Registros | Tamaño (bytes) | Grupo | Estado análisis |\n|---------|-----------|----------------|-------|-----------------|\n`
for (const line of lines) {
  const m = line.match(/^\| ([^|]+) \| ([^|]+) \| ([^|]+) \|/)
  if (!m) continue
  const file = m[1].trim()
  if (file === 'Archivo') continue
  const rec = m[2].trim()
  const size = m[3].trim()
  out += `| ${file} | ${rec} | ${size} | ${grupo(file)} | pendiente |\n`
}
process.stdout.write(out)
