/**
 * @en Restore CLI argument parsing (#449).
 * @es Parseo de argumentos CLI de restore (#449).
 * @pt-BR Parse de argumentos CLI de restore (#449).
 */

/** @en Explicit refusal message when --yes is missing. */
export const RESTORE_REQUIRES_YES = 'Refusing destructive restore without --yes'

/**
 * @en Parses restore CLI flags (#449 tests cover --yes gate).
 * @es Parsea flags CLI de restore (#449 tests cubren el gate --yes).
 * @pt-BR Faz parse dos flags CLI de restore (#449 testes cobrem o gate --yes).
 */
export function parseRestorePostgresArgs(argv: string[]): {
  list: boolean
  yes: boolean
  file: string | null
  db: string | null
} {
  let list = false
  let yes = false
  let file: string | null = null
  let db: string | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--list') list = true
    else if (a === '--yes' || a === '-y') yes = true
    else if (a === '--file' || a === '-f') {
      file = argv[++i] ?? null
    } else if (a === '--db') {
      db = argv[++i] ?? null
    }
  }
  return { list, yes, file, db }
}
