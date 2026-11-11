# Readiness de seguridad pre-comercial (#194)

**Rol:** Evaluación go/no-go de controles de seguridad **antes de datos reales de clientes / cobros reales**.  
**Issue:** [#194](https://github.com/ayelenleclerc/BizCode/issues/194) · bloque [#452](https://github.com/ayelenleclerc/BizCode/issues/452)  
**Fecha de evidencia:** 2026-11-11 contra `develop` (triaje ZAP `fix/194-zap-baseline-triage`; readiness previa 2026-11-08).

Este documento **no** contrata vendor, no inventa hallazgos ni cierra #194. El [registro de informe de pentest](../../evidence/pentest-report-register.md) vacío sigue siendo residual bloqueante del AC completo.

## Alcance

| En alcance | Fuera de alcance |
|------------|------------------|
| Inventario CI vs AC del issue | Contratar opciones A/B/C |
| Gaps explícitos (token Snyk, registro vacío; estado triage ZAP) | Informe externo simulado |
| Go/no-go para uso de **datos reales** | Cerrar #194 o afirmar listo comercial |
| Enlaces a pruebas de penetración + matriz piloto | Implementar FCEM / status page / DR staging |

## Criterios de aceptación vs evidencia en el repo

| AC #194 (issue) | Evidencia en repo | Estado |
|-----------------|-------------------|--------|
| Escaneo automático (ZAP + Snyk) en CI/CD antes de prod | [`.github/workflows/zap.yml`](../../../.github/workflows/zap.yml) (sin `-I`; `ubuntu-24.04`; reglas en [`.zap/rules.tsv`](../../../.zap/rules.tsv)); [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml); `pnpm audit --audit-level=high` en Quality Gate | **Parcial** — ZAP baseline bloquea merge en WARN/FAIL no ignorados; Snyk **omite** sin `SNYK_TOKEN` |
| Cero Critical/High sin mitigar antes de lanzamiento | Audit + Snyk (con token) + triage de dependencias (#219) | **Condicional** — gate HIGH+ de audit existe; Snyk no garantizado; ZAP bloquea alertas no ignoradas |
| Informe de pentest externo + plan de remediación | [pentest-report-register.md](../../evidence/pentest-report-register.md) | **No evidenciado** — registro vacío |
| Critical del informe externo mitigados antes de lanzamiento comercial | N/A hasta existir informe | **Bloqueado** por decisión vendor/presupuesto (#452) |

## Checklist previo al engagement vs evidencia

| Tarea previa #194 | Evidencia / nota |
|-------------------|------------------|
| Audit + actualizar deps vulnerables | Quality Gate audit HIGH+; [escaneo-dependencias-y-triage.md](escaneo-dependencias-y-triage.md) |
| Escaneo Snyk | Workflow presente; enforcement depende del secret `SNYK_TOKEN` |
| Revisar endpoints | Trabajo de producto continuo — **no** cerrado por este doc |
| SQL raw sin sanitizar | Política en [pruebas-de-penetracion.md](pruebas-de-penetracion.md); revisar código antes de vendor |
| Logs sin tokens/passwords/PII | Checklist en [seguridad.md](../seguridad.md) — confirmación ops |

## Go / no-go — datos reales de clientes

### Go (solo piloto / sintético)

1. Compuertas técnicas del piloto (#446–#451, #450) separadas de seguridad comercial.
2. Sin PII real / datos fiscales de producción / cobros live Mercado Pago en el entorno bajo prueba.
3. Ops reconoce los gaps residuales de la tabla siguiente.

### No-go (datos reales / cobros comerciales)

**No-go** si:

1. Registro de pentest externo vacío **y** la propietaria no aceptó por escrito el riesgo residual para un piloto acotado.
2. `SNYK_TOKEN` ausente en el repositorio que despliega el host comercial.
3. ~~ZAP con `-I` sin triage~~ — **mitigado 2026-11-11** (sin `-I`; `10049` IGNORE documentado para 404 del API efímero). Reevaluar caché en staging con `ZAP_TARGET_URL`.
4. Critical/High de dependencias abiertos sin ADR/excepción.

**Veredicto 2026-11-11:** **NO-GO para datos reales** — gate ZAP endurecido; AC de informe externo incumplido; Snyk condicional a `SNYK_TOKEN`.

## Gaps explícitos (no inventar)

| Gap | Ubicación | Impacto |
|-----|-----------|---------|
| Registro externo vacío | `docs/evidence/pentest-report-register.md` | Bloquea AC completo #194 |
| Snyk opcional | `.github/workflows/snyk.yml` | Gate omitido sin token |
| Contratar vendor | Presupuesto / #452 | No es tarea de código Cursor |
| ZAP `-I` (histórico) | Quitado de `.github/workflows/zap.yml` | Mitigado — ver [`.zap/rules.tsv`](../../../.zap/rules.tsv) |

## Relacionado

- [Pruebas de penetración](pruebas-de-penetracion.md)
- [Matriz de cobertura piloto](matriz-cobertura-piloto-distribuidora.md)
- [SLA](sla.md) / [Recuperación ante desastres](recuperacion-ante-desastres.md) (#197)

## Otros idiomas

- English: [pre-commercial-security-readiness.md](../../en/quality/pre-commercial-security-readiness.md)
- Português: [prontidao-seguranca-precomercial.md](../../pt-br/quality/prontidao-seguranca-precomercial.md)

## Historial

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-11-08 | BizCode | Evaluación inicial de readiness #194 |
| 0.2 | 2026-11-11 | BizCode | Triaje ZAP: quitar `-I`, IGNORE `10049`, ubuntu-24.04; NO-GO permanece (registro vacío) |
