# ISO/IEC 27001:2022 Anexo A — análisis de brechas inicial (#196)

**Rol del documento:** Análisis de brechas canónico para preparación SGSI de BizCode (ISO-ready).  
**Referencia normativa:** ISO/IEC 27001:2022 Anexo A (93 controles).  
**Regla de evidencia:** El estado se basa solo en evidencia del repositorio (código, CI, docs). Sin afirmar certificación.

| Campo | Valor |
|-------|--------|
| Issue relacionado | [#196](https://github.com/ayelenleclerc/BizCode/issues/196) |
| Stub SoA | [SEC-002](../certificacion-iso/sec/sec-002-declaracion-aplicabilidad-soa.md) |
| Registro de riesgos | [RSK-002](../certificacion-iso/rsk/rsk-002-registro-riesgos.md) |
| Plan de tratamiento | [RSK-004](../certificacion-iso/rsk/rsk-004-plan-tratamiento-riesgos.md) |
| Fecha de análisis | 2026-08-25 |

## Leyenda de estado

| Estado | Significado |
|--------|-------------|
| Implemented | La intención del control se cumple con evidencia verificable en el repo para el alcance de producto |
| Partial | Hay evidencia parcial; quedan brechas (a menudo org/ops o issues pendientes) |
| Not evidenced | No hay evidencia adecuada en el repositorio |
| N/A | Fuera del alcance SGSI de producto actual (justificado) |

## Alcance SGSI (producto)

En alcance: aplicación BizCode (web, API, escritorio, móviles documentados), controles de ingeniería en CI y scripts, procedimientos documentados en `docs/`.

Fuera / operador: controles físicos A.7, HR formal A.6 (salvo lo documentado), informe de pentest externo (#194), SLA/drill DR (#197).

## Resumen de conteos (inicial)

| Estado | Aprox. |
|--------|--------|
| Implemented | 0 |
| Partial | 53 |
| Not evidenced | 26 |
| N/A | 14 |
| **Total** | **93** |

Conteo indicativo (conservador: la evidencia de producto es mayormente **Partial**).

---

## A.5 Controles organizacionales

| Control | Título (corto) | Estado | Evidencia / brecha |
|---------|----------------|--------|-------------------|
| A.5.1 | Políticas de seguridad de la información | Partial | [seguridad.md](../seguridad.md); política ISMS en #196 |
| A.5.2 | Roles y responsabilidades | Partial | [matriz RBAC](matriz-rbac-roles-permisos-scopes.md), [modelo IAM](modelo-iam-sesiones-auditoria.md) |
| A.5.3 | Segregación de funciones | Partial | Separación RBAC; sin matriz SoD formal |
| A.5.4 | Responsabilidades de la dirección | Not evidenced | Sin registro de compromiso directivo en repo |
| A.5.5 | Contacto con autoridades | Not evidenced | Sin registro |
| A.5.6 | Contacto con grupos de interés especiales | Not evidenced | Sin registro |
| A.5.7 | Inteligencia de amenazas | Partial | STRIDE/OWASP en [seguridad.md](../seguridad.md) |
| A.5.8 | Seguridad en gestión de proyectos | Partial | DoR/DoD en [plan maestro](ejecucion-plan-maestro-bizcode.md) |
| A.5.9 | Inventario de información y activos | Partial | [mapa-datos-personales.md](../mapa-datos-personales.md); SEC-003 stub |
| A.5.10 | Uso aceptable | Not evidenced | Sin política AUP |
| A.5.11 | Devolución de activos | N/A | Corporativo / no en repo de producto |
| A.5.12 | Clasificación de la información | Partial | Clases de privacidad; sin esquema completo |
| A.5.13 | Etiquetado | Not evidenced | Sin esquema |
| A.5.14 | Transferencia de información | Partial | TLS; canales documentados parciales |
| A.5.15 | Control de acceso | Partial | RBAC + `requirePermission` |
| A.5.16 | Gestión de identidades | Partial | [modelo IAM](modelo-iam-sesiones-auditoria.md) |
| A.5.17 | Información de autenticación | Partial | Hash de contraseñas; secretos en env |
| A.5.18 | Derechos de acceso | Partial | Gestión de usuarios + RBAC |
| A.5.19 | Seguridad en relaciones con proveedores | Partial | Plantilla SEC-013; sin filas |
| A.5.20 | Seguridad en acuerdos con proveedores | Not evidenced | Sin cláusulas archivadas |
| A.5.21 | Cadena de suministro TIC | Partial | `pnpm audit`, Snyk |
| A.5.22 | Seguimiento de servicios de proveedor | Not evidenced | Sin cadencia |
| A.5.23 | Uso de servicios en la nube | Partial | Entornos de despliegue; Doppler; Cloudflare |
| A.5.24 | Planificación de gestión de incidentes | Partial | [respuesta-a-incidentes.md](respuesta-a-incidentes.md) |
| A.5.25 | Evaluación de eventos de seguridad | Partial | [monitoreo-de-seguridad.md](monitoreo-de-seguridad.md) |
| A.5.26 | Respuesta a incidentes | Partial | Runbooks; registro SEC-009 stub |
| A.5.27 | Aprendizaje de incidentes | Partial | Post-mortem documentado; sin registro lleno |
| A.5.28 | Recolección de evidencia | Partial | Audit events / forense documentado |
| A.5.29 | Seguridad durante la disrupción | Partial | Runbooks DR [#197](https://github.com/ayelenleclerc/BizCode/issues/197); drill staging pendiente |
| A.5.30 | Continuidad TIC | Partial | SEC-014/015 + backup #150; status page + drill staging pendientes (#197) |
| A.5.31 | Requisitos legales y contractuales | Partial | Privacidad #195; ADR-0007 |
| A.5.32 | Derechos de propiedad intelectual | Not evidenced | Sin política IP |
| A.5.33 | Protección de registros | Partial | Auditoría / plantillas ISO |
| A.5.34 | Privacidad y PII | Partial | Guía de privacidad #195 |
| A.5.35 | Revisión independiente | Not evidenced | Registro pentest vacío; #194 |
| A.5.36 | Cumplimiento de políticas y normas | Partial | CI Quality Gate, docs-map |
| A.5.37 | Procedimientos operativos documentados | Partial | Backup, deploy, incidentes |

## A.6 Controles de personas

| Control | Título (corto) | Estado | Evidencia / brecha |
|---------|----------------|--------|-------------------|
| A.6.1 | Selección | N/A | RR.HH. corporativo |
| A.6.2 | Términos de empleo | N/A | RR.HH. |
| A.6.3 | Concienciación y formación | Not evidenced | Stubs HR vacíos |
| A.6.4 | Proceso disciplinario | N/A | RR.HH. |
| A.6.5 | Tras cese o cambio de empleo | Partial | Revocación de sesiones documentada |
| A.6.6 | Acuerdos de confidencialidad | N/A | Legal corporativo |
| A.6.7 | Trabajo remoto | Not evidenced | Sin política |
| A.6.8 | Notificación de eventos | Partial | Monitoreo + respuesta a incidentes |

## A.7 Controles físicos

Todos **N/A** bajo el alcance SaaS/escritorio actual (seguridad física de hosting/oficina = operador/proveedor).

| Control | Título (corto) | Estado | Evidencia / brecha |
|---------|----------------|--------|-------------------|
| A.7.1 | Perímetros de seguridad física | N/A | Operador/proveedor |
| A.7.2 | Acceso físico | N/A | Operador/proveedor |
| A.7.3 | Oficinas, salas e instalaciones | N/A | Operador/proveedor |
| A.7.4 | Supervisión de seguridad física | N/A | Operador/proveedor |
| A.7.5 | Amenazas físicas y ambientales | N/A | Operador/proveedor |
| A.7.6 | Trabajo en áreas seguras | N/A | Operador/proveedor |
| A.7.7 | Escritorio y pantalla limpios | N/A | Política corporativa / endpoint |
| A.7.8 | Emplazamiento y protección de equipos | N/A | Operador/proveedor |
| A.7.9 | Activos fuera de las instalaciones | N/A | Corporativo / dispositivos cliente |
| A.7.10 | Medios de almacenamiento | N/A | Operador (excepto artefactos de backup cifrados — A.8.13) |
| A.7.11 | Servicios de apoyo | N/A | Operador/proveedor |
| A.7.12 | Seguridad del cableado | N/A | Operador/proveedor |
| A.7.13 | Mantenimiento de equipos | N/A | Operador/proveedor |
| A.7.14 | Disposición o reutilización segura | N/A | Operador/proveedor |

## A.8 Controles tecnológicos

| Control | Título (corto) | Estado | Evidencia / brecha |
|---------|----------------|--------|-------------------|
| A.8.1 | Dispositivos endpoint | Partial | Hardening móvil #220; allowlist Tauri |
| A.8.2 | Acceso privilegiado | Partial | SuperAdmin; SEC-006 stub |
| A.8.3 | Restricción de acceso a la información | Partial | Permisos + tenant; IDOR foco #194 |
| A.8.4 | Acceso al código fuente | Partial | Permisos GitHub org |
| A.8.5 | Autenticación segura | Partial | Sesión + hash |
| A.8.6 | Gestión de capacidad | Not evidenced | Sin plan |
| A.8.7 | Protección contra malware | Not evidenced | Operador/cliente |
| A.8.8 | Vulnerabilidades técnicas | Partial | SEC-010; audit/Snyk/ZAP |
| A.8.9 | Gestión de configuración | Partial | Env, Docker, workflows |
| A.8.10 | Borrado de información | Partial | Derechos del titular; borrado parcial |
| A.8.11 | Enmascaramiento de datos | Not evidenced | Sin framework |
| A.8.12 | Prevención de fuga de datos | Partial | Redacción de logs |
| A.8.13 | Copia de seguridad | Partial | Backup/restore #150 |
| A.8.14 | Redundancia | Partial | Checklist migración en [recuperacion-ante-desastres.md](recuperacion-ante-desastres.md); sin multi-AZ automático; drill staging pendiente (#197) |
| A.8.15 | Registro (logging) | Partial | Observabilidad + eventos |
| A.8.16 | Supervisión | Partial | Monitoreo de seguridad |
| A.8.17 | Sincronización de reloj | Not evidenced | NTP del host no documentado |
| A.8.18 | Utilidades privilegiadas | Not evidenced | Sin control documentado |
| A.8.19 | Instalación de software en operación | Partial | Imágenes CI/GHCR |
| A.8.20 | Seguridad de redes | Partial | Helmet/CORS; Cloudflare |
| A.8.21 | Servicios de red | Partial | TLS hosted; loopback desktop |
| A.8.22 | Segregación de redes | Partial | Staging vs producción #152 |
| A.8.23 | Filtrado web | N/A | No es control de producto |
| A.8.24 | Criptografía | Partial | TLS; backups cifrados; tokens |
| A.8.25 | Ciclo de vida de desarrollo seguro | Partial | Tests, lint, PR a `develop` |
| A.8.26 | Requisitos de seguridad de aplicaciones | Partial | OpenAPI, a11y, headers |
| A.8.27 | Arquitectura e ingeniería seguras | Partial | ADR-0007; multi-tenant |
| A.8.28 | Codificación segura | Partial | TS estricto; `check:raw-sql` |
| A.8.29 | Pruebas de seguridad | Partial | ZAP; pentest externo pendiente |
| A.8.30 | Desarrollo externalizado | Not evidenced | Sin procedimiento |
| A.8.31 | Separación de entornos | Partial | Entornos de despliegue |
| A.8.32 | Gestión de cambios | Partial | PR + CI |
| A.8.33 | Información de prueba | Partial | Fixtures/seeds |
| A.8.34 | Protección durante pruebas de auditoría | Partial | ZAP efímero/staging; sin datos cliente prod |

## Temas prioritarios de brecha

1. Revisión de seguridad independiente externa (#194).
2. Aprobación formal de política ISMS y RACI.
3. Continuidad / drill DR y SLA (#197).
4. Inventario y clasificación de activos (SEC-003).
5. Cláusulas de proveedores + SEC-013.
6. Formación de concienciación (HR).
7. Capacidad / redundancia / reloj para ops hosted.

## Otros idiomas

- English: [iso27001-annex-a-gap-analysis.md](../../en/quality/iso27001-annex-a-gap-analysis.md)
- Português: [analise-lacunas-anexo-a-iso27001.md](../../pt-br/quality/analise-lacunas-anexo-a-iso27001.md)

## Historial de revisiones

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-08-25 | BizCode | Gap Anexo A inicial #196 |
