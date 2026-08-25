# Registro de evidencias de prueba de restauración

| Código de documento | SEC-015 |
| Versión | 0.2 |
| Fecha | 2026-08-25 |
| Autor | BizCode |
| Nivel de requisito | Altamente recomendado |
| Aplicabilidad normativa | ISO/IEC 27001:2022 |
| Estado de evidencia | Parcial — smoke restore Docker local; drill staging pendiente (#197) |

## Declaración de fuera de alcance

Un **smoke local** **no** cumple el AC de drill staging de [#197](https://github.com/ayelenleclerc/BizCode/issues/197).

## Propósito

Registrar ejercicios de restore cronometrados (local y staging) frente a RTO &lt; 4 hs.

## Entradas

| Fecha (UTC) | Entorno | Tipo | Artefacto | BD destino | Tiempo restore | RTO vs &lt;4h | Operador | Notas |
|-------------|---------|------|-----------|------------|----------------|-------------|----------|-------|
| 2026-08-25T16:00:47Z | Docker local `bizcode_db` `:5432` | Smoke local | `bizcode-pg-bizcode_dev-20260825T160047Z.sql.gz.enc` | `bizcode_restore_smoke_197` (eliminada) | Backup ~1.8 s; restore ~2.8 s; total ~5.4 s | Cumple (solo path) | Agente Eng (#197) | Clave efímera; **no** staging; no cierra AC #197 |
| _(pendiente)_ | Staging remoto | Drill semestral | _(pendiente)_ | _(pendiente)_ | _(pendiente)_ | _(pendiente)_ | _(pendiente)_ | Requiere host `STAGING_DEPLOY_*` |

## Historial

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | Fila smoke local #197 |
