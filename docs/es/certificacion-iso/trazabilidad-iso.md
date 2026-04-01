# Matriz de trazabilidad ISO

Esta matriz relaciona los artefactos de calidad de BizCode con cláusulas de normas ISO aplicables. La documentación controlada existe en **tres idiomas** (`docs/en/`, `docs/es/`, `docs/pt-br/`) con **nombres de archivo localizados** por idioma. Véase [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) y [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md). El **registro maestro del paquete ISO** es [indice-paquete-iso.md](indice-paquete-iso.md) (véase también [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)).

| Entregable / Artefacto | ISO 9001:2015 | ISO/IEC 12207:2017 | ISO/IEC 27001:2022 | ISO/IEC 25010:2023 | ISO/IEC 29119 |
|---|---|---|---|---|---|
| **indice-paquete-iso.md** (ISO-PKG-001) + [Certificación-ISO/README.md](../../../Certificación-ISO/README.md) | §7.5 | §6.1.3 | — | — | — |
| **docs/evidence/sbom-cyclonedx.json** (SBOM-001) + [`npm run sbom:generate`](../../../package.json) | §8.1 | §6.3.8 | A.8.31 | — | — |
| **estrategia-pruebas.md** + Vitest (100% en `src/lib/**` y `server/createApp.ts`) | §8.7 | §6.4.9 | — | Confiabilidad §4.2.2 | 29119-2, 29119-4 |
| **accesibilidad.md** + jsx-a11y + `App.a11y.test.tsx` | §8.1 | — | — | Usabilidad §4.2.4 | — |
| **estrategia-i18n.md** + check-i18n en CI | §8.1 | — | — | Portabilidad §4.2.8 | — |
| **seguridad.md** | §8.1 | §6.3.8 | A.8.x | Seguridad §4.2.6 | — |
| **docs/api/openapi.yaml** + `tests/api/contract.test.ts` | §8.3 | §6.3.2 | — | Idoneidad funcional §4.2.1 | 29119-2 |
| **plan-swagger-openapi-ui.md** (espejos EN/PT) — checklist Swagger UI, política OpenAPI agentes | §7.5, §8.3 | §6.3.2, §6.4.12 | — | Idoneidad funcional §4.2.1 | 29119-2 |
| **ADR-0003** | §8.3.3 | §6.3.6 | — | Mantenibilidad §4.2.7 | — |
| **ciclo-ci-cd.md** + `.github/workflows/ci.yml` | §8.5 | §6.3.6 | A.8.25 | — | — |
| **manual-calidad.md** | §4.4, §10.2 | §6.1 | — | — | — |
| **ADR-0001**, **ADR-0002** | §8.3.3 | §6.3.2 | — | — | — |
| **mapa-datos-personales.md** | §8.1 | — | A.5.12, A.5.33 | — | — |
| **Manuales de usuario** | §7.5 | §6.4.12 | — | Usabilidad §4.2.4 | — |
| **temas-interfaz.md** | §8.3 | §6.4.12 | — | Usabilidad §4.2.4 | — |
| **CONTRIBUTING.md** Definition of Done | §8.5.1 | §6.3.6 | A.8.25 | — | 29119-2 §7 |
| **plantillas-registros.md** | §10.2.2 | §6.7.1 | A.5.33 | — | 29119-3 |
| **glosario.md** | §7.5 | §6.1.3 | — | — | — |
| Carpeta **`specs/`** (índice, manual técnico, RF/RNF, casos de uso, historias, casos de prueba manual, matriz de trazabilidad) | §8.3 | §6.4.12 | — | Idoneidad funcional | 29119-3 (catálogo MVP de pruebas manuales) |

## Notas

- La aplicabilidad de ISO/IEC 27001 es limitada (app desktop monousuario sin exposición de red operativa).
- ISO 29119: partes 2 y 4 cubiertas por la estrategia de pruebas; la parte 3 (documentación de pruebas) tiene soporte MVP en `docs/*/specs/manual-test-cases.md` y registros con [plantillas-registros.md](plantillas-registros.md).

**Otros idiomas:** [English](../../en/certificacion-iso/iso-traceability.md) · [Português](../../pt-br/certificacion-iso/rastreabilidade-iso.md)
