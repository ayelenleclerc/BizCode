# Documentación BizCode (español)

## Enlaces rápidos

| Documento | Contenido |
|-----------|-----------|
| [arquitectura.md](arquitectura.md) | Tauri, React, Express, Prisma, PostgreSQL |
| [temas-interfaz.md](temas-interfaz.md) | Tema claro/oscuro: Tailwind `dark:`, `<html>`, `localStorage`, `index.html` |
| [estandares-codigo.md](estandares-codigo.md) | TypeScript, React, pruebas, i18n, `data-testid` |
| [accesibilidad.md](accesibilidad.md) | WCAG 2.2 AA, ESLint jsx-a11y, jest-axe |
| [estrategia-i18n.md](estrategia-i18n.md) | Locales `es`, `en`, `pt-BR`, paridad en CI |
| [seguridad.md](seguridad.md) | Amenazas, secretos, CORS, dependencias |
| [mapa-datos-personales.md](mapa-datos-personales.md) | Inventario de datos personales |
| [glosario.md](glosario.md) | Términos de dominio |
| [historial-de-cambios.md](historial-de-cambios.md) | Historial de versiones (Keep a Changelog) |

## Calidad y trazabilidad

| Documento | Contenido |
|-----------|-----------|
| [Certificación-ISO (raíz)](../../Certificación-ISO/README.md) | Punto de entrada al paquete ISO (sin duplicar cuerpos) |
| [certificacion-iso/indice-paquete-iso.md](certificacion-iso/indice-paquete-iso.md) | Registro maestro del paquete (ISO-PKG-001) |
| [certificacion-iso/manual-calidad.md](certificacion-iso/manual-calidad.md) | Alcance del QMS |
| [certificacion-iso/trazabilidad-iso.md](certificacion-iso/trazabilidad-iso.md) | Matriz norma → evidencia en repo |
| [quality/estrategia-pruebas.md](quality/estrategia-pruebas.md) | Pirámide de pruebas, política de cobertura |
| [quality/ciclo-ci-cd.md](quality/ciclo-ci-cd.md) | Pipeline GitHub Actions |
| [certificacion-iso/plantillas-registros.md](certificacion-iso/plantillas-registros.md) | Plantillas de no conformidad y sesión de prueba |
| [certificacion-iso/ciclo-vida-y-validacion-documental.md](certificacion-iso/ciclo-vida-y-validacion-documental.md) | SemVer, historial de cambios, lista de validación / verificación |
| [quality/plan-swagger-openapi-ui.md](quality/plan-swagger-openapi-ui.md) | Referencia versionada Swagger UI + OpenAPI; política para agentes |
| [quality/documentacion-generada.md](quality/documentacion-generada.md) | TypeDoc, OpenAPI→Markdown, esquemas JSON, SBOM — versionar salidas con los cambios de código |

## API y decisiones

| Documento | Contenido |
|-----------|-----------|
| [../api/openapi.yaml](../api/openapi.yaml) | Contrato OpenAPI 3 (único archivo, no traducido) |
| Swagger UI | `http://localhost:3001/api-docs/` con [`npm run server`](../../package.json) en ejecución (mismo spec que `openapi.yaml`) |
| [adr/README.md](adr/README.md) | Índice de Architecture Decision Records |

## Manuales de usuario

| Documento | Contenido |
|-----------|-----------|
| [user/manual-clientes.md](user/manual-clientes.md) | Módulo Clientes |
| [user/manual-articulos.md](user/manual-articulos.md) | Módulo Artículos |
| [user/manual-facturacion.md](user/manual-facturacion.md) | Módulo Facturación |
| [user/manual-apariencia.md](user/manual-apariencia.md) | Tema claro/oscuro (botón lateral) |

## Especificaciones de producto (MVP ISO-ready)

| Documento | Contenido |
|-----------|-----------|
| [specs/indice.md](specs/indice.md) | Índice: manual técnico, RF/RNF, casos de uso, historias, casos de prueba manual, matriz de trazabilidad |

---

**Otros idiomas:** [English](../en/README.md) · [Português (Brasil)](../pt-br/README.md) · [Política de documentación](../I18N_DOCUMENTATION.md)

Raíz del repositorio: [README.md](../../README.md), [CONTRIBUTING.md](../../CONTRIBUTING.md).
