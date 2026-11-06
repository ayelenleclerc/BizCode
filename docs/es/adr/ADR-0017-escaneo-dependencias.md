# ADR-0017: Escaneo de vulnerabilidades en dependencias y contenedores

**Estado:** Aceptado  
**Fecha:** 2026-07-28  
**Referencia ISO:** ISO/IEC 27001:2022 A.8.8 (gestión de vulnerabilidades técnicas); A.5.23 (seguridad de la información para uso de servicios en la nube)

---

## Contexto

BizCode ya ejecuta `pnpm audit` informativo, CodeQL, Gitleaks, SBOM CycloneDX y Trivy **IaC** sobre Terraform. El issue #219 exige PRs automáticos de Dependabot, CI bloqueante ante hallazgos HIGH (Snyk + audit), escaneo de **imágenes** Docker (Trivy) antes del push al registry, badge en README y proceso de triage documentado. El monorepo usa **pnpm** (`pnpm-lock.yaml`).

## Decisión

1. **Dependabot:** `.github/dependabot.yml` con ecosistema `npm` en `/` (workspace pnpm) y `github-actions` en `/`, schedule **weekly**, grupos de **patch**.
2. **Audit gate:** Quality Gate ejecuta `pnpm audit --audit-level=high` **sin** `continue-on-error`.
3. **Snyk:** Job de Actions con secreto `SNYK_TOKEN`. Con el secreto: `snyk test --severity-threshold=high --fail-on=upgradable` en PR/push; `snyk monitor` en push a `develop`/`main`. Sin `SNYK_TOKEN`, el job omite el escaneo con warning (Quality Gate sigue bloqueando vía `pnpm audit`); ops debe añadir el secreto para activar el gate Snyk.
4. **Trivy imágenes:** Tras `docker build` en Deploy Containers, escanear tags locales; **fallar en CRITICAL** antes de publicar en GHCR.
5. **Documentación:** Guía de triage trilingüe bajo `docs/*/quality/`. Badge Snyk en README para `ayelenleclerc/BizCode` (ops debe enlazar el repo en Snyk una vez). La generación SBOM usa `pnpm dlx @cyclonedx/cdxgen` (compatible con pnpm 10) en lugar de `@cyclonedx/cyclonedx-npm`.
6. **Fuera de alcance v1:** Socket.dev, Renovate, `dependency-review-action`.

## Consecuencias

- **Positivo:** PRs de deps automatizados; detección multicapa; evidencia ISO de vulnerabilidades técnicas.
- **Negativo:** El gate Snyk permanece inactivo hasta configurar `SNYK_TOKEN`; las primeras corridas de Snyk pueden fallar hasta remediar HIGH/CRITICAL con fix o subir imágenes base.
- **Remediación:** Preferir bumps patch/minor en el mismo cambio; excepciones temporales deben registrarse en este ADR con vencimiento (ninguna al aceptar).
- **Ignore de audit aceptado (2026-07-28):** `pnpm.auditConfig.ignoreCves` incluye `CVE-2026-14257` (`brace-expansion` / GHSA-mh99-v99m-4gvg). El rango publicado `<=5.0.7` también coincide con líneas ya fijadas `1.1.16` / `2.1.3`; el árbol fuerza `brace-expansion@5` a una línea 5.x parcheada. Revisar cuando el advisory publique rangos por major o cuando minimatch deje majors legacy. Revisión: **2026-10-28** (extendida **2027-02-02** mientras los majors sigan fijados por overrides).
- **Ignores de audit aceptados (2026-11-02, remediación CI PR #445):**
  - `CVE-2026-85393` (`node-forge` vía Expo CLI en `apps/driver` / `apps/seller`): el advisory no publica fix para este ID (`patched <0.0.0`); advisories hermanos de Forge se mitigan con override `node-forge@^1.4.1`. Revisar cuando Expo publique el transitivo parcheado o el advisory gane fix. Revisión: **2027-02-02**.
  - `CVE-2023-54404` / GHSA-mrhx-c7xc-m3w5 (`zod`): el fix exige **zod ≥ 4.6.6**; la app sigue en **zod 3.x** (major breaking). El `zod@4` transitivo (tooling Scalar OpenAPI) se fuerza a `4.6.6` vía override. La migración de la app a Zod 4 queda fuera de alcance de esta remediación. Revisión: **2027-02-02**.
  - `GHSA-g2v6-rqmx-r4w6` (`@vue/server-renderer` solo vía `@scalar/openapi-to-markdown`): Vue **no** es dependencia de UI del producto (BizCode web es React). Forzar overrides `@vue/*` rompió `docs:openapi-md` (varias copias de `@vue/runtime-core` → `Cannot define property div`). Aceptado como riesgo de tooling de docs en build sobre OpenAPI confiable hasta que Scalar publique un árbol Vue alineado. Revisión: **2027-02-02**.

## Referencias

- Issue #219
- [Triage de escaneo de dependencias](../quality/escaneo-dependencias-y-triage.md)
- [CI/CD](../quality/ciclo-ci-cd.md)
