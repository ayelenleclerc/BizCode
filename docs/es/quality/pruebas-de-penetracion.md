# Pruebas de penetración (#194)

## Propósito

Describe cómo BizCode prepara y registra las **pruebas de penetración** antes del lanzamiento comercial: DAST automatizado (OWASP ZAP) en CI, gates de dependencias de #219, y el engagement **externo** requerido para un informe formal.

**Estado de evidencia:** el workflow ZAP baseline está implementado en CI. Un informe de pentest **externo no está evidenciado** hasta que ops archive un entregable real del proveedor. No es una afirmación de certificación.

## Qué hay en CI y qué no

| Control | Ubicación | ¿Bloquea merge? |
|---------|-----------|-----------------|
| `pnpm audit --audit-level=high` | Quality Gate | Sí (HIGH+) |
| Snyk | [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml) | Sí con `SNYK_TOKEN` |
| OWASP ZAP baseline | [`.github/workflows/zap.yml`](../../../.github/workflows/zap.yml) | No hasta quitar `-I` tras triage |
| Informe pentest externo | Ops + [registro](../../evidence/pentest-report-register.md) | Requerido para el AC completo de #194 |

**Los informes ZAP de CI no sustituyen el informe de pentest externo.**

## Workflow ZAP baseline

1. En PR/push a `develop`/`main` y `workflow_dispatch`.
2. Objetivo por defecto: API efímera en `http://127.0.0.1:3001`.
3. Variable de repositorio opcional `ZAP_TARGET_URL` (solo staging/no prod). Fail-closed si el valor es inválido. **No** apuntar a producción con datos o secretos reales.
4. Docker con `--network host`.
5. Reglas: [`.zap/rules.tsv`](../../../.zap/rules.tsv); tras triage, quitar `-I` para fallar en WARN/FAIL restantes.
6. Artefacto `zap-baseline-report` (14 días). No versionar reportes sin revisión.

## Checklist de ingeniería pre-engagement

Ver [seguridad.md](../seguridad.md).

## Engagement externo (ops)

Opciones en [#194](https://github.com/ayelenleclerc/BizCode/issues/194). El MVP automatizado **no** cierra el AC del informe externo.

1. Elegir proveedor y alcance.
2. Solo **staging**; rotar credenciales al terminar.
3. Completar [pentest-report-register.md](../../evidence/pentest-report-register.md).
4. Issues de remediación; Critical/High antes del lanzamiento comercial.
5. Mantener [#194](https://github.com/ayelenleclerc/BizCode/issues/194) **OPEN** hasta evidencia real + seguimiento de críticos.

## Stubs ISO

- [SEC-010](../certificacion-iso/sec/sec-010-vulnerabilidades-parches.md)
- [SEC-013](../certificacion-iso/sec/sec-013-evaluacion-seguridad-proveedores.md)

## Relacionado

- [seguridad.md](../seguridad.md)
- [escaneo-dependencias-y-triage.md](escaneo-dependencias-y-triage.md)
- [ciclo-ci-cd.md](ciclo-ci-cd.md)

**Otros idiomas:** [English](../en/quality/penetration-testing.md) · [Português](../pt-br/quality/testes-de-penetracao.md)
