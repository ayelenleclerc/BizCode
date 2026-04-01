# Manual de calidad

**Documento:** QM-001  
**Versión:** 1.0  
**Fecha:** 2026-03-31  
**Norma:** ISO 9001:2015

---

## 1. Alcance

Este manual aplica al desarrollo y mantenimiento de **BizCode**, aplicación desktop de gestión comercial. Cubre el ciclo de vida desde requisitos hasta entrega, incluyendo diseño, implementación, pruebas y documentación.

No cubre fabricación física, prestación de servicios externos ni soporte posventa.

## 2. Política de calidad

BizCode se desarrolla para ser **fiable, usable y auditable**:

- Código visible para el usuario cubierto por pruebas automatizadas con umbrales definidos.
- Cada artefacto de build pasa una puerta de calidad CI en varias etapas antes del merge.
- La documentación se mantiene junto al código en el mismo repositorio (inglés, español y portugués brasileño en `docs/en/`, `docs/es/`, `docs/pt-br/`).
- Accesibilidad (WCAG 2.2 AA) e internacionalización (3 locales) son requisitos de primera clase.
- Los defectos se registran, priorizan y resuelven con causa raíz documentada cuando sea posible.

## 3. Roles y responsabilidades

| Rol | Responsabilidad |
|---|---|
| Desarrollador | Código, pruebas y documentación; cumple el DoD antes del PR |
| Revisor | Revisa PRs por corrección, estándares y cobertura |
| Pipeline CI | Aplica type-check, lint, umbrales de cobertura y paridad i18n |
| Product Owner | Define requisitos; acepta características según el DoD |

## 4. Control documental

Los documentos controlados bajo `docs/` existen en **tres idiomas** con **nombres de archivo localizados** por árbol (mapa canónico en [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)). El historial lo mantiene git; la rama `main` es la fuente autoritativa.

**Documentos incluidos:** este manual, estrategia de pruebas, ciclo CI/CD, trazabilidad ISO, estándares de código, accesibilidad, estrategia i18n, seguridad, [ciclo-vida-y-validacion-documental.md](ciclo-vida-y-validacion-documental.md) (SemVer, historial, validación) y todos los ADR.

## 5. No conformidad y acción correctiva

1. Detectar (CI o revisión manual).  
2. Contener (bloquear merge o revertir).  
3. Analizar causa raíz (ver plantillas en [plantillas-registros.md](plantillas-registros.md)).  
4. Corregir y verificar.  
5. Prevenir (nuevo test o regla ESLint).  
6. Registrar.

## 6. Mejora continua

Issues con etiqueta `quality`; revisión al inicio de cada sprint. Informe de cobertura CI archivado 14 días y revisado en cada release.

**Otros idiomas:** [English](../../en/quality/quality-manual.md) · [Português](../../pt-br/quality/manual-qualidade.md)
