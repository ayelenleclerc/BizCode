# Privacidad y derechos del titular (#195)

## Propósito

Describe cómo BizCode soporta derechos del titular (Ley 25.326 / alineación GDPR) sobre datos personales de **clientes** en `Cliente`. Complementa el [mapa de datos personales](../mapa-datos-personales.md) e ISO [PRV-001](../certificacion-iso/prv/prv-001-politica-privacidad.md).

**Estado de evidencia:** Implementado en producto (exportar, anonimizar, `/privacidad` pública, consent UI en alta). El registro AAIP sigue siendo tarea **administrativa del operador**. No es afirmación de certificación.

## Evidencia de producto

| Capacidad | Evidencia |
|-----------|-----------|
| Acceso / exportación | `GET /api/clientes/:id/exportar-datos` (`?format=json\|csv`) — `owner` o `super_admin` + `customers.manage` + ownership |
| Rectificación | `PUT /api/clientes/:id` existente |
| Supresión (anonimización) | `POST /api/clientes/:id/anonimizar` con `{ "confirm": "ANONYMIZE" }`; `Cliente.anonymizedAt`; revoca sesiones portal; conserva filas fiscales |
| Página pública | `/privacidad` (sin autenticación) |
| Consentimiento en alta | Checkbox UI (no persistido); consentimiento onboarding SaaS en `/registro` (#180) |
| Servicio | [`ClientePrivacyService.ts`](../../../apps/server/services/ClientePrivacyService.ts) |

## Retención (política documentada)

| Categoría | Política |
|-----------|----------|
| Documentos fiscales / CUIT en facturas | **10 años** (anonimizar PII del maestro; no borrar facturas) |
| Contacto comercial opcional | Hasta solicitud / anonimización (orientación **~5 años** comercial) |
| GPS chofer | **7 días** |

## Registro AAIP (operador)

Procedimiento ante la AAIP a cargo del operador. **No inventar** número de inscripción en este repositorio.

## Fuera de alcance

- Consent onboarding SaaS (#180) — entregado; véase [onboarding-saas-self-service.md](onboarding-saas-self-service.md)
- Centro de preferencias de marketing
- Entornos staging/prod (#152)

## Relacionado

- [Mapa de datos personales](../mapa-datos-personales.md)
- [PRV-001](../certificacion-iso/prv/prv-001-politica-privacidad.md)
