/**
 * @en Regenerates committed docs; skips OS-specific SBOM in CI (see docs:sbom).
 * @es Regenera documentación commitada; omite SBOM específico del SO en CI (ver docs:sbom).
 * @pt-BR Regenera documentação commitada; omite SBOM específico do SO no CI (ver docs:sbom).
 */
import { execSync } from 'node:child_process'

const steps = ['docs:extract-schemas', 'docs:schemas-md', 'docs:openapi-md', 'docs:typedoc']
const inCi = Boolean(process.env.CI || process.env.GITHUB_ACTIONS)

for (const step of steps) {
  // CI: avoid spawnSync ENOBUFS when TypeDoc prints very large stdout.
  console.log(`[docs:generate] ${step}`)
  execSync(`npm run ${step}`, {
    stdio: inCi ? ['ignore', 'ignore', 'inherit'] : 'inherit',
    maxBuffer: 64 * 1024 * 1024,
  })
}

if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
  execSync('npm run docs:sbom', { stdio: 'inherit', maxBuffer: 64 * 1024 * 1024 })
}
