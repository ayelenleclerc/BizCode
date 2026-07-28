# Escaneo de dependencias y triage (#219)

## Propósito

Cómo responder a alertas de Dependabot, `pnpm audit`, Snyk y Trivy (imágenes) en BizCode.

Decisión normativa: [ADR-0017](../adr/ADR-0017-escaneo-dependencias.md).

## Herramientas en CI

| Herramienta | Dónde | Gate |
|-------------|--------|------|
| Dependabot | `.github/dependabot.yml` | Abre PRs semanales (npm workspace + GitHub Actions); revisar y mergear |
| `pnpm audit --audit-level=high` | Quality Gate (`ci.yml`), `dependency-maintenance.yml` | **Bloquea** HIGH+ (ver ADR para `ignoreCves` aceptados) |
| Snyk `test` / `monitor` | `.github/workflows/snyk.yml` | **Bloquea** HIGH+ con fix (`--fail-on=upgradable`); requiere `SNYK_TOKEN` |
| Trivy image | `deploy.yml` tras `docker build` | **Bloquea** CRITICAL antes del push a GHCR |
| Trivy IaC | `infrastructure-validation.yml` | Terraform (existente) |
| SBOM CycloneDX | `docs/evidence/sbom-cyclonedx.json` | Regenerar con `pnpm run sbom:generate` (`pnpm dlx @cyclonedx/cdxgen`) / `docs:generate` |

## Setup: `SNYK_TOKEN`

1. Crear cuenta Snyk y enlazar el repo GitHub `ayelenleclerc/BizCode`.
2. Crear token de servicio con acceso al proyecto.
3. Añadir secreto de repositorio **`SNYK_TOKEN`**.
4. Sin el secreto, el workflow de Snyk falla con mensaje accionable (a propósito).

## Setup: badge Snyk en README

El badge del README refleja el estado Snyk del repo. Tras enlazar el proyecto en Snyk, se actualiza solo. Si aparece “unknown”, confirmar la integración en la UI de Snyk.

## Playbook de triage

1. **Origen:** PR de Dependabot, log de audit en CI, UI/CLI Snyk o paso Trivy image.
2. **Severidad:** CRITICAL/HIGH con fix publicado → remediar antes del merge. Moderate → planificar.
3. **Preferir:** bump de dependencia directa o `pnpm.overrides` puntual; `pnpm install` y `pnpm audit --audit-level=high`.
4. **Contenedores:** subir tags `FROM` en Dockerfiles si CRITICAL está en la imagen base; rebuild y re-scan.
5. **Excepciones:** solo vía `pnpm.auditConfig.ignoreCves` (o enmienda al ADR) con motivo y fecha de revisión — nunca `continue-on-error` silencioso en el audit del Quality Gate.
6. **Verificar:** audit local exit 0; push y confirmar jobs Snyk + Trivy en verde.

## Fuera de alcance

Socket.dev, Renovate, certificate pinning mobile (#220).
