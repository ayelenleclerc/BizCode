# Paquete ISO — registro maestro

**Documento:** ISO-PKG-001  
**Versión:** 1.1  
**Fecha:** 2026-04-01  

Índice maestro de documentación orientada a ISO bajo `docs/en/certificacion-iso/`, `docs/es/certificacion-iso/` y `docs/pt-br/certificacion-iso/` (y `docs/*/processes/`). **No implica certificación ISO** (ISO-ready).

**Punto de entrada (raíz del repositorio):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

**Registros de apoyo:** [registro-trazabilidad-documentos-normas.md](registro-trazabilidad-documentos-normas.md) · [trazabilidad-entre-documentos.md](trazabilidad-entre-documentos.md) · [convencion-documentos-controlados.md](convencion-documentos-controlados.md)

**Índice de manuales de proceso:** [../processes/indice.md](../processes/indice.md)

## Leyenda de niveles (stubs)

| Clave | Significado |
|-------|-------------|
| M | Obligatorio |
| HR | Muy recomendado |
| SA | Según alcance |
| HE | Muy esperado |

## Documentos ancla / legado (antes del catálogo de stubs)

| Código | Documento lógico | Ruta canónica (es) | Notas |
|--------|------------------|---------------------|--------|
| ISO-PKG-001 | Este registro maestro | [indice-paquete-iso.md](indice-paquete-iso.md) | Trilingüe |
| QM-001 | Manual de calidad | [manual-calidad.md](manual-calidad.md) | ISO 9001:2015 |
| QMS-TR-001 | Matriz de trazabilidad ISO | [trazabilidad-iso.md](trazabilidad-iso.md) | Norma → evidencia |
| DOC-CTL-001 | Ciclo de vida y validación documental | [ciclo-vida-y-validacion-documental.md](ciclo-vida-y-validacion-documental.md) | SemVer |
| REC-TPL-001 | Plantillas de registros | [plantillas-registros.md](plantillas-registros.md) | NC, pruebas |
| QMS-DR-001 | Registro documentos — referencia normativa | [registro-trazabilidad-documentos-normas.md](registro-trazabilidad-documentos-normas.md) | Indicativo |
| QMS-D2D-001 | Trazabilidad entre documentos | [trazabilidad-entre-documentos.md](trazabilidad-entre-documentos.md) | Grafo |
| META-CONVENTION-001 | Convención de documentos controlados | [convencion-documentos-controlados.md](convencion-documentos-controlados.md) | Metadatos |
| PROD-VISION-001 | Visión de producto | [vision-producto-y-despliegue.md](../quality/vision-producto-y-despliegue.md) | [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) |

## Catálogo cerrado de stubs (108 códigos)


## GOV — Gobierno

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| GOV-001 | [Alcance del sistema de gestión](gov/gov-001-alcance-sistema-gestion.md) | M |
| GOV-002 | [Política del sistema de gestión](gov/gov-002-politica-sistema-gestion.md) | M |
| GOV-003 | [Objetivos e indicadores](gov/gov-003-objetivos-e-indicadores.md) | M |
| GOV-004 | [Mapa de procesos](gov/gov-004-mapa-procesos.md) | HR |
| GOV-005 | [Partes interesadas y matriz de requisitos](gov/gov-005-partes-interesadas-matriz-requisitos.md) | M |
| GOV-006 | [Roles y responsabilidades (RACI)](gov/gov-006-matriz-raci.md) | HR |
| GOV-007 | [Procedimiento de control documental y de registros](gov/gov-007-control-documental-registros.md) | M |
| GOV-008 | [Procedimiento de gestión del cambio](gov/gov-008-gestion-cambio.md) | HR |
| GOV-009 | [Procedimiento de auditoría interna](gov/gov-009-auditoria-interna.md) | M |
| GOV-010 | [Plantilla de actas de revisión por la dirección](gov/gov-010-actas-revision-direccion.md) | M |
| GOV-011 | [Procedimiento de no conformidad y acción correctiva](gov/gov-011-no-conformidad-accion-correctiva.md) | M |
| GOV-012 | [Registro de mejora continua](gov/gov-012-mejora-continua.md) | HR |

## RSK — Riesgos

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| RSK-001 | [Metodología de gestión de riesgos](rsk/rsk-001-metodologia-gestion-riesgos.md) | M |
| RSK-002 | [Registro de riesgos](rsk/rsk-002-registro-riesgos.md) | M |
| RSK-003 | [Informe de evaluación de riesgos](rsk/rsk-003-informe-evaluacion-riesgos.md) | M |
| RSK-004 | [Plan de tratamiento de riesgos](rsk/rsk-004-plan-tratamiento-riesgos.md) | M |
| RSK-005 | [Registro de oportunidades](rsk/rsk-005-registro-oportunidades.md) | HR |
| RSK-006 | [Registro de riesgos aceptados](rsk/rsk-006-registro-riesgos-aceptados.md) | HR |

## SEC — Seguridad de la información

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| SEC-001 | [Política de seguridad de la información](sec/sec-001-politica-seguridad-informacion.md) | M |
| SEC-002 | [Declaración de aplicabilidad (SoA)](sec/sec-002-declaracion-aplicabilidad-soa.md) | M |
| SEC-003 | [Inventario de activos de información](sec/sec-003-inventario-activos-informacion.md) | M |
| SEC-004 | [Política de control de acceso](sec/sec-004-politica-control-acceso.md) | HR |
| SEC-005 | [Procedimiento de gestión de accesos de usuario](sec/sec-005-gestion-accesos-usuario.md) | HR |
| SEC-006 | [Registro de accesos privilegiados](sec/sec-006-registro-accesos-privilegiados.md) | HR |
| SEC-007 | [Procedimiento de copia de seguridad y restauración](sec/sec-007-backup-restauracion.md) | HR |
| SEC-008 | [Procedimiento de gestión de incidentes](sec/sec-008-gestion-incidentes.md) | HR |
| SEC-009 | [Registro de incidentes de seguridad](sec/sec-009-registro-incidentes-seguridad.md) | HR |
| SEC-010 | [Procedimiento de gestión de vulnerabilidades y parches](sec/sec-010-vulnerabilidades-parches.md) | HR |
| SEC-011 | [Procedimiento de monitorización de logs y alertas](sec/sec-011-logs-alertas.md) | HR |
| SEC-012 | [Política de criptografía](sec/sec-012-politica-criptografia.md) | SA |
| SEC-013 | [Registro de evaluación de seguridad de proveedores](sec/sec-013-evaluacion-seguridad-proveedores.md) | HR |
| SEC-014 | [Plan de continuidad del negocio y recuperación](sec/sec-014-continuidad-recuperacion.md) | SA |
| SEC-015 | [Registro de evidencias de prueba de restauración](sec/sec-015-evidencias-prueba-restauracion.md) | HR |

## QLT — Calidad / ciclo de vida del software

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| QLT-001 | [Procedimiento del ciclo de vida del software](qlt/qlt-001-ciclo-vida-software.md) | HR |
| QLT-002 | [Procedimiento de gestión de requisitos](qlt/qlt-002-gestion-requisitos.md) | HR |
| QLT-003 | [Procedimiento de diseño y desarrollo](qlt/qlt-003-diseno-desarrollo.md) | HR |
| QLT-004 | [Procedimiento de configuración y control de versiones](qlt/qlt-004-configuracion-control-versiones.md) | HR |
| QLT-005 | [Procedimiento de publicación y despliegue](qlt/qlt-005-publicacion-despliegue.md) | HR |
| QLT-006 | [Registro de cambios en producción](qlt/qlt-006-registro-cambios-produccion.md) | HR |
| QLT-007 | [Procedimiento de gestión de defectos](qlt/qlt-007-gestion-defectos.md) | HR |
| QLT-008 | [Cuadro de métricas de calidad](qlt/qlt-008-metricas-calidad.md) | HR |
| QLT-009 | [Procedimiento de evaluación de proveedores](qlt/qlt-009-evaluacion-proveedores.md) | SA |
| QLT-010 | [Lista de proveedores aprobados](qlt/qlt-010-proveedores-aprobados.md) | SA |

## REQ — Requisitos

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| REQ-001 | [Documento de requisitos de negocio (BRD)](req/req-001-documento-requisitos-negocio-brd.md) | HR |
| REQ-002 | [Especificación de requisitos de software (SRS)](req/req-002-especificacion-requisitos-software-srs.md) | HR |
| REQ-003 | [Especificación de requisitos funcionales (FRS)](req/req-003-especificacion-requisitos-funcionales-frs.md) | HR |
| REQ-004 | [Especificación de requisitos no funcionales (NFR)](req/req-004-requisitos-no-funcionales-nfr.md) | HR |
| REQ-005 | [Casos de uso e historias de usuario](req/req-005-casos-uso-historias-usuario.md) | HR |
| REQ-006 | [Catálogo de criterios de aceptación](req/req-006-criterios-aceptacion.md) | HR |
| REQ-007 | [Matriz de trazabilidad de requisitos (RTM)](req/req-007-matriz-trazabilidad-requisitos-rtm.md) | HR |
| REQ-008 | [Registro de cambios de requisitos](req/req-008-registro-cambios-requisitos.md) | HR |

## TST — Pruebas

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| TST-001 | [Política / estrategia de pruebas](tst/tst-001-politica-estrategia-pruebas.md) | HR |
| TST-002 | [Plan maestro de pruebas](tst/tst-002-plan-maestro-pruebas.md) | HR |
| TST-003 | [Catálogo de casos de prueba](tst/tst-003-catalogo-casos-prueba.md) | HR |
| TST-004 | [Procedimiento de gestión de datos de prueba](tst/tst-004-gestion-datos-prueba.md) | HR |
| TST-005 | [Evidencia de ejecución de pruebas](tst/tst-005-evidencia-ejecucion-pruebas.md) | HR |
| TST-006 | [Registro de defectos](tst/tst-006-registro-defectos.md) | HR |
| TST-007 | [Informe de pruebas de regresión](tst/tst-007-informe-pruebas-regresion.md) | HR |
| TST-008 | [Registro de pruebas de aceptación de usuario (UAT)](tst/tst-008-registro-pruebas-aceptacion-uat.md) | HR |
| TST-009 | [Criterios de entrada y salida](tst/tst-009-criterios-entrada-salida.md) | HR |
| TST-010 | [Informe resumen de pruebas](tst/tst-010-informe-resumen-pruebas.md) | HR |

## ARC — Arquitectura / operación

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| ARC-001 | [Resumen de arquitectura](arc/arc-001-resumen-arquitectura.md) | HR |
| ARC-002 | [Diagramas de aplicación e integración](arc/arc-002-diagramas-aplicacion-integracion.md) | HR |
| ARC-003 | [Inventario de entornos](arc/arc-003-inventario-entornos.md) | HR |
| ARC-004 | [Especificación API (OpenAPI)](arc/arc-004-especificacion-api-openapi.md) | SA |
| ARC-005 | [Runbooks operativos](arc/arc-005-runbooks-operativos.md) | HR |
| ARC-006 | [Procedimiento de monitorización y observabilidad](arc/arc-006-monitorizacion-observabilidad.md) | HR |
| ARC-007 | [Plan de reversión de publicación](arc/arc-007-plan-reversion-publicacion.md) | HR |
| ARC-008 | [Registros de problema](arc/arc-008-registros-problema.md) | SA |

## SRV — Gestión de servicios

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| SRV-001 | [Plan de gestión de servicios](srv/srv-001-plan-gestion-servicios.md) | HE |
| SRV-002 | [Catálogo de servicios](srv/srv-002-catalogo-servicios.md) | HR |
| SRV-003 | [Catálogo de SLA](srv/srv-003-catalogo-sla.md) | HR |
| SRV-004 | [Procedimiento de gestión de incidentes](srv/srv-004-gestion-incidentes.md) | HR |
| SRV-005 | [Procedimiento de petición de servicio](srv/srv-005-peticion-servicio.md) | HR |
| SRV-006 | [Procedimiento de gestión de problemas](srv/srv-006-gestion-problemas.md) | HR |
| SRV-007 | [Procedimiento de continuidad del servicio](srv/srv-007-continuidad-servicio.md) | HR |
| SRV-008 | [Gestión de capacidad y disponibilidad](srv/srv-008-capacidad-disponibilidad.md) | HR |
| SRV-009 | [Informes KPIs de servicio](srv/srv-009-informes-kpis-servicio.md) | HR |
| SRV-010 | [Registros de operaciones](srv/srv-010-registros-operaciones.md) | HR |

## HR — Personas

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| HR-001 | [Matriz de competencias](hr/hr-001-matriz-competencias.md) | HE |
| HR-002 | [Plan de formación](hr/hr-002-plan-formacion.md) | HR |
| HR-003 | [Registros de formación](hr/hr-003-registros-formacion.md) | HR |
| HR-004 | [Descripciones de puesto](hr/hr-004-descripciones-puesto.md) | HR |
| HR-005 | [Programa de concienciación en seguridad](hr/hr-005-concienciacion-seguridad.md) | HR |
| HR-006 | [Lista de incorporación y baja](hr/hr-006-onboarding-offboarding.md) | HR |

## PRV — Privacidad

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| PRV-001 | [Política de privacidad](prv/prv-001-politica-privacidad.md) | SA |
| PRV-002 | [Inventario de tratamiento de datos personales](prv/prv-002-inventario-tratamiento-datos.md) | SA |
| PRV-003 | [Procedimiento de conservación y supresión de datos](prv/prv-003-conservacion-supresion-datos.md) | SA |
| PRV-004 | [Procedimiento de derechos de los interesados](prv/prv-004-derechos-interesados.md) | SA |
| PRV-005 | [Registro de incidentes de privacidad](prv/prv-005-registro-incidentes-privacidad.md) | SA |

## AI — Inteligencia artificial

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| AI-001 | [Alcance del sistema de gestión de IA](ai/ai-001-alcance-sistema-gestion-ia.md) | M |
| AI-002 | [Política de IA responsable](ai/ai-002-politica-ia-responsable.md) | HR |
| AI-003 | [Inventario de sistemas de IA](ai/ai-003-inventario-sistemas-ia.md) | HR |
| AI-004 | [Evaluación de riesgos e impacto de IA](ai/ai-004-evaluacion-riesgos-impacto-ia.md) | HR |
| AI-005 | [Modelo de supervisión humana y aprobación](ai/ai-005-supervision-humana-aprobacion.md) | HR |
| AI-006 | [Procedimiento de gobernanza de datos de IA](ai/ai-006-gobernanza-datos-ia.md) | HR |
| AI-007 | [Registro de incidentes de IA](ai/ai-007-registro-incidentes-ia.md) | HR |
| AI-008 | [Control del ciclo de vida del modelo de IA](ai/ai-008-ciclo-vida-modelo-ia.md) | HR |

## PROC-MAN — Manuales de proceso

| Código | Documento (es) | Nivel de requisito |
|------|-----------------|---------------------|
| PROC-MAN-001 | [Proceso: requisitos y análisis](../processes/proc-man-001-requisitos-y-analisis.md) | HR |
| PROC-MAN-002 | [Proceso: diseño y desarrollo](../processes/proc-man-002-diseno-desarrollo.md) | HR |
| PROC-MAN-003 | [Proceso: compilación, integración y CI](../processes/proc-man-003-build-integracion-ci.md) | HR |
| PROC-MAN-004 | [Proceso: pruebas y barreras de calidad](../processes/proc-man-004-pruebas-calidad.md) | HR |
| PROC-MAN-005 | [Proceso: publicación y despliegue](../processes/proc-man-005-publicacion-despliegue.md) | HR |
| PROC-MAN-006 | [Proceso: seguridad de la información en desarrollo](../processes/proc-man-006-seguridad-desarrollo.md) | HR |
| PROC-MAN-007 | [Proceso: servicio y soporte](../processes/proc-man-007-servicio-soporte.md) | HR |
| PROC-MAN-008 | [Proceso: proveedores y terceros](../processes/proc-man-008-proveedores-terceros.md) | HR |
| PROC-MAN-009 | [Proceso: control documental y de registros](../processes/proc-man-009-control-documental-registros.md) | HR |
| PROC-MAN-010 | [Proceso: continuidad y recuperación](../processes/proc-man-010-continuidad-recuperacion.md) | HR |

## Calidad operativa enlazada (no duplicada)

| Área | Ruta (es) |
|------|-----------|
| Estrategia de pruebas | [../quality/estrategia-pruebas.md](../quality/estrategia-pruebas.md) |
| CI/CD | [../quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| Plan Swagger / OpenAPI UI | [../quality/plan-swagger-openapi-ui.md](../quality/plan-swagger-openapi-ui.md) |

## Especificaciones y API

| Artefacto | Ruta |
|-----------|------|
| Contrato OpenAPI | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Índice de especificaciones | [../specs/indice.md](../specs/indice.md) |

## Evidencia de cadena de suministro (SBOM)

| Código | Artefacto | Cómo generar |
|--------|-----------|--------------|
| SBOM-001 | CycloneDX JSON | `npm run sbom:generate` → [docs/evidence/sbom-cyclonedx.json](../../evidence/sbom-cyclonedx.json) |

Ver [docs/evidence/README.md](../../evidence/README.md).

**Otros idiomas:** [English](../../en/certificacion-iso/iso-package-index.md) · [Português](../../pt-br/certificacion-iso/indice-pacote-iso.md)
