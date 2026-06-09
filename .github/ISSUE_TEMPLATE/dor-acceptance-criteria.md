---
name: "Backlog Item (with DoR)"
description: "Create a backlog item with verifiable acceptance criteria (Definition of Ready)"
labels: ["backlog", "needs-triage"]
---

## 📋 Descripción
<!-- Describe the feature, bug, or improvement -->

## 🎯 Aceptación (DoR - Definition of Ready)

Para que este issue sea considerado "listo para implementar", DEBE cumplir con TODOS los siguientes criterios:

- [ ] **Criterio verificable:** Incluyo un comando `npm run ...` o una ruta que prueba esta solución
- [ ] **Sin dependencias ocultas:** No hay acoplamiento con otros módulos de fiscalidad (ver [ADR-0007](../../docs/en/adr/ADR-0007-dual-deployment-and-fiscal-modularity.md))
- [ ] **Impacto i18n identificado:** Si toca UI/API, debo actualizar `src/locales/{es,en,pt-BR}/`
- [ ] **Prioridad asignada:** P0 (blocker), P1 (next sprint), o P2 (post-MVP)
- [ ] **Área definida:** Frontend, Backend, DevOps, Infrastructure, QA, ISO/Documentation, o Cybersecurity

## ✅ Criterios de Aceptación

### Requerido
```
- [ ] [Command/Path] valida la solución
- [ ] `npm run lint` pasa sin warnings
- [ ] `npm run type-check` pasa sin errores
```

### Por tipo de cambio
- **Si es Backend:**
  - [ ] Nuevo endpoint? Documenta en `docs/api/openapi.yaml`
  - [ ] Cambio DB? Crea migration: `npx prisma migrate dev --name <name>`
  - [ ] Cambio auth? Actualiza `src/lib/rbac.ts`

- **Si es Frontend:**
  - [ ] Componente reusable? Agrega a UI component library
  - [ ] Cambio de rutas? Actualiza `src/pages/`
  - [ ] Traducciones? Completa ES/EN/PT-BR en `src/locales/`

- **Si es DevOps/Infrastructure:**
  - [ ] Cambio Docker? Actualiza `Dockerfile`
  - [ ] Cambio Terraform? Corre `terraform plan` contra staging
  - [ ] Cambio secrets? Documenta en `docs/quality/secrets-management.md`

- **Si es Testing/QA:**
  - [ ] Unit tests? Target ≥75% coverage en módulo afectado
  - [ ] E2E? Critical path documentado en `tests/e2e/`
  - [ ] a11y? Pasa `npm run test:a11y`

## 📚 Contexto
<!-- Link to related docs, issues, PRs, discussions -->

### Referencias
- Master plan: [master-plan-bizcode-execution.md](../../docs/en/quality/master-plan-bizcode-execution.md)
- Audit relevante: [backend-standards.mdc](../../.cursor/rules/backend-standards.mdc) | [frontend-standards.mdc](../../.cursor/rules/frontend-standards.mdc) | [devops-standards.mdc](../../.cursor/rules/devops-standards.mdc)
- Testing strategy: [testing-strategy.md](../../docs/en/quality/testing-strategy.md)

## 🏷️ Labels (seleccionar al menos uno)

- `area: backend`
- `area: frontend`
- `area: devops`
- `area: infrastructure`
- `area: qa`
- `area: cybersecurity`
- `area: iso-documentation`

- `priority: p0` — Blocker, impide deployment
- `priority: p1` — Siguiente sprint
- `priority: p2` — Post-MVP

---

**⚠️ NOTA:** Issues sin criterios de aceptación verificables serán rechazados en DoR review.
