/**
 * Post-process TypeDoc HTML for static hosting and Edge Tools / Webhint-style checks.
 *
 * @en Adds noopener on other blank-target anchors; normalizes TypeDoc footer link; removes autocapitalize on search input (Safari compat hint).
 * @es Ajusta enlaces y atributos del HTML estático generado por TypeDoc para reducir avisos del analizador.
 * @pt-BR Ajusta links e atributos do HTML estático do TypeDoc para reduzir avisos de ferramentas de análise.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TYPEDOC_DIR = path.join(ROOT, 'docs', 'generated', 'typedoc')

/**
 * @param {string} html
 * @returns {string}
 */
function patchBlankTargetAnchors(html) {
  return html.replace(/<a\b([^>]*)>/gi, (full, inner) => {
    if (!/\btarget\s*=\s*["']_blank["']/i.test(inner)) return full
    if (/\brel\s*=\s*["'][^"']*noopener/i.test(inner)) return full
    if (/\brel\s*=\s*(["'])([^"']*)\1/i.test(inner)) {
      return full.replace(/\brel\s*=\s*(["'])([^"']*)\1/i, (m, quote, relVal) => {
        if (/noopener/i.test(relVal)) return m
        const merged = `${relVal} noopener noreferrer`.replace(/\s+/g, ' ').trim()
        return `rel=${quote}${merged}${quote}`
      })
    }
    return `<a${inner} rel="noopener noreferrer">`
  })
}

/**
 * TypeDoc footer uses target=_blank; Edge Tools requires rel=noopener. Same-tab link avoids the false positive.
 *
 * @param {string} html
 * @returns {string}
 */
function normalizeTypedocGeneratorFooter(html) {
  return html.replace(
    /<a href="https:\/\/typedoc\.org\/" target="_blank"(?:\s+rel="[^"]*")?\s*>TypeDoc<\/a>/g,
    '<a href="https://typedoc.org/">TypeDoc</a>',
  )
}

/**
 * @en Edge Tools reports autocapitalize on search inputs as unsupported in Safari; safe to drop for this search box.
 * @param {string} html
 * @returns {string}
 */
function stripSearchInputAutocapitalize(html) {
  return html.replace(/\s*autocapitalize=["']off["']/gi, '')
}

/**
 * TypeDoc emits `href=""` for self-references. Static analyzers flag empty href.
 *
 * @param {string} html
 * @param {string} pageBasename e.g. `server_errors_AppError.ConflictAppError.html`
 * @returns {string}
 */
function fixTypedocEmptyHref(html, pageBasename) {
  if (!pageBasename.includes('.html')) return html
  return html.replace(/<a href=""/g, `<a href="${pageBasename}"`)
}

/**
 * @param {string} html
 * @param {string} pageBasename
 * @returns {string}
 */
function patchHtmlDocument(html, pageBasename) {
  let out = html
  out = patchBlankTargetAnchors(out)
  out = normalizeTypedocGeneratorFooter(out)
  out = stripSearchInputAutocapitalize(out)
  out = fixTypedocEmptyHref(out, pageBasename)
  return out
}

function listHtmlFiles(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) out.push(...listHtmlFiles(p))
    else if (name.name.endsWith('.html')) out.push(p)
  }
  return out
}

function main() {
  const files = listHtmlFiles(TYPEDOC_DIR)
  let changed = 0
  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8')
    const after = patchHtmlDocument(before, path.basename(file))
    if (after !== before) {
      fs.writeFileSync(file, after, 'utf8')
      changed += 1
    }
  }
  console.log(
    `patch-typedoc-html-noopener: ${files.length} HTML file(s), ${changed} updated under docs/generated/typedoc/`,
  )
}

main()
