/**
 * @en Regenerates committed docs; skips OS-specific SBOM in CI (see docs:sbom).
 * @es Regenera documentación commitada; omite SBOM específico del SO en CI (ver docs:sbom).
 * @pt-BR Regenera documentação commitada; omite SBOM específico do SO no CI (ver docs:sbom).
 */
import { execSync } from 'node:child_process'

const steps = ['docs:extract-schemas', 'docs:schemas-md', 'docs:openapi-md', 'docs:typedoc']

for (const step of steps) {
  execSync(`npm run ${step}`, { stdio: 'inherit' })
}

if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
  execSync('npm run docs:sbom', { stdio: 'inherit' })
}
