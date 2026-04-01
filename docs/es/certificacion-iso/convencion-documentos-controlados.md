# Convención de documentos controlados (paquete ISO)

**Documento:** META-CONVENTION-001  
**Versión:** 1.0  
**Fecha:** 2026-04-01  

Este documento define la **nomenclatura y disposición** de los stubs de documentos controlados bajo `docs/{en,es,pt-br}/certificacion-iso/` y `docs/{en,es,pt-br}/processes/`.

## Disposición de carpetas (ejemplo árbol en inglés)

| Prefijo familia | Subcarpeta bajo `certificacion-iso/` |
|-----------------|--------------------------------------|
| GOV-* | `gov/` |
| RSK-* | `rsk/` |
| SEC-* | `sec/` |
| QLT-* | `qlt/` |
| REQ-* | `req/` |
| TST-* | `tst/` |
| ARC-* | `arc/` |
| SRV-* | `srv/` |
| HR-* | `hr/` |
| PRV-* | `prv/` |
| AI-* | `ai/` |
| PROC-MAN-* | `../processes/` |

Índice de manuales de proceso: `processes/indice.md` (por idioma).

## Patrón de nombre de archivo

- **Inglés:** `kebab-case.md`; incluir prefijo de código cuando ayude (p. ej. `gov-001-scope-of-management-system.md`).
- **Español / portugués:** mismo prefijo de código + **slug descriptivo localizado** (véase [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)).

## Metadatos obligatorios (cada stub)

- **Código de documento**, **Versión**, **Fecha**, **Autor**
- **Nivel de requisito** (Obligatorio / Muy recomendado / Según alcance / Muy esperado)
- **Aplicabilidad normativa**
- **Estado de evidencia** (No evidenciado / Parcial / Evidenciado — con enlaces si aplica)
- **Declaración de fuera de alcance** cuando el producto no evidencie el alcance
- **Cuerpo canónico** (enlaces si la narrativa vive en otro sitio)
- **Historial de revisiones** (solo añadir filas; no borrar entradas previas)

## Historial de revisiones

| Versión | Fecha | Autor | Resumen de cambios |
|---------|-------|-------|-------------------|
| 1.0 | 2026-04-01 | BizCode | Convención inicial |

**Otros idiomas:** [English](../../en/certificacion-iso/controlled-document-convention.md) · [Português](../../pt-br/certificacion-iso/convencao-documentos-controlados.md)
