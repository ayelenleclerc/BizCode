# Política de privacidad

| Código de documento | PRV-001 |
| Versión | 0.2 |
| Fecha | 2026-07-30 |
| Autor | BizCode |
| Nivel de requisito | Según aplique |
| Aplicabilidad normativa | ISO/IEC 27701:2019 |
| Estado de evidencia | Parcial — tooling de producto evidenciado (#195); registro AAIP pendiente del operador |

## Declaración de fuera de alcance

Este documento describe controles de privacidad del producto BizCode sobre datos de clientes. No afirma certificación ISO/IEC 27701.


## Propósito

Definir cómo se inventarian, acceden, rectifican y anonimizan los datos personales de clientes (`Cliente`) en BizCode, y remitir al operador las obligaciones de registro AAIP.

## Evidencia de producto (#195)

Narrativa operativa (trilingüe): [Privacidad y derechos del titular](../../quality/privacidad-y-derechos-del-titular.md).

UI pública: `/privacidad`. APIs: `GET /api/clientes/{id}/exportar-datos`, `POST /api/clientes/{id}/anonimizar`. Inventario: [mapa-datos-personales.md](../../mapa-datos-personales.md).

## Historial de revisiones

| Versión | Fecha | Autor | Resumen de cambios |
|--------------|-----------|-------------|----------------|
| 0.2 | 2026-07-30 | BizCode | Evidencia de producto #195 |
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
