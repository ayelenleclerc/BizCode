# ADR-0007: Despliegue dual (escritorio / SaaS) y modularidad fiscal

**Estado:** Aceptada  
**Fecha:** 2026-04-01  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2 (diseño de software); ISO 9001:2015 §8.3.3 (salidas de diseño)

---

## Contexto

BizCode se entrega hoy como aplicación **Tauri escritorio** con **API Express local** y **PostgreSQL** ([arquitectura.md](../arquitectura.md)). La estrategia de producto apunta al **mismo dominio** para un **SaaS alojado** en el futuro y a un comportamiento **fiscal por país** (facturación electrónica, impuestos, integraciones con administraciones) sin mantener **dos productos ajenos** ni un **repositorio bifurcado permanente**.

Opciones consideradas:

1. **Repositorio clonado separado** para SaaS — MVP rápido pero deriva y duplicación a largo plazo.
2. **Monorepo único, núcleo compartido, módulos fiscales enchufables y adaptadores de despliegue** — más disciplina inicial, una fuente de verdad.

## Decisión

1. **Un repositorio / monorepo** sigue siendo el valor por defecto; evitar un segundo clon permanente «solo SaaS» salvo restricción externa fuerte (documentada en un ADR futuro).
2. **Dos modos de entrega** son objetivos de primer nivel: **escritorio** (actual) y **SaaS** (web + API alojada + BD gestionada, multi-tenant si aplica). Comparten **lógica de dominio** y **contrato API** ([OpenAPI](../../api/openapi.yaml)); cambian despliegue y aislamiento.
3. El comportamiento **fiscal** se organiza en **módulos o capas por país/jurisdicción**, activables por **configuración, licencia o tenant** — no duplicado como condicionales ad hoc en archivos no relacionados.
4. **Canal (escritorio vs nube) y jurisdicción (p. ej. Argentina vs otros países)** son dimensiones **independientes**; la priorización comercial no debe acoplarse técnicamente sin documentación explícita ([vision-producto-y-despliegue.md](../quality/vision-producto-y-despliegue.md)).
5. **Docker opcional** para API + base está permitido para dev/deploy servidor cuando se introduzca; **no** sustituye builds nativos Tauri (ver documento de visión).

## Consecuencias

- **Positivo:** Trayectoria clara hacia SaaS; extensiones fiscales localizadas; OpenAPI y pruebas de contrato siguen siendo ancla de integración.
- **Negativo:** Exige disciplina en PRs (citar visión o este ADR al cambiar despliegue o fiscal); aspectos propios del SaaS (facturación de suscripción, residencia de datos, aislamiento multi-tenant) requieren **ADRs adicionales** al implementarse.
- **API:** Cualquier API pública SaaS debe **alinearse o versionarse explícitamente** respecto al contrato OpenAPI; cambios rupturistas exigen ADR y actualización de pruebas de contrato según [ADR-0003](ADR-0003-api-contract-testing.md).

## Referencias

- [vision-producto-y-despliegue.md](../quality/vision-producto-y-despliegue.md) (PROD-VISION-001)
- [arquitectura.md](../arquitectura.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
