# Recuperación ante desastres — BizCode (#197)

**Rol:** Runbooks DR para BizCode hospedado (ISO-ready).  
**Issue:** [#197](https://github.com/ayelenleclerc/BizCode/issues/197)  
**Hub:** [docs/DISASTER_RECOVERY.md](../../DISASTER_RECOVERY.md)

No afirma certificación ni drill staging completado. Smoke local ≠ AC staging.

## Objetivos

| Objetivo | Meta | Notas |
|----------|------|-------|
| RTO | &lt; 4 hs | Restaurar servicio tras desastre declarado |
| RPO | &lt; 24 hs | Backup nocturno ([backup-y-restauracion.md](backup-y-restauracion.md)) |

**No evidenciado:** réplica automática / failover. Recuperación = **restore desde backup** + redeploy.

## Contactos de emergencia (plantilla)

| Rol | Nombre / equipo | Canal | Notas |
|-----|-----------------|-------|-------|
| Incident commander | _(pendiente)_ | | |
| Platform / DBA | _(pendiente)_ | | |
| Soporte hosting | _(pendiente)_ | | |
| Product owner | _(pendiente)_ | | |
| Seguridad | _(pendiente)_ | | [respuesta-a-incidentes.md](respuesta-a-incidentes.md) |

## RACI

| Actividad | Eng | Ops | Product owner |
|-----------|-----|-----|---------------|
| Declarar desastre | C | R | A |
| Reiniciar contenedores | C | R | I |
| Backup / restore | C | R | I |
| Migración de proveedor | C | R | A |
| Aviso a clientes | C | C | R |
| Contención seguridad | R | C | A |

---

## Escenario 1 — Fallo del servidor de aplicación

Compose con `restart: unless-stopped` + `healthcheck` ([`docker-compose.staging.yml`](../../../docker-compose.staging.yml)).

1. Revisar monitor/host.  
2. SSH al host ([entornos-despliegue.md](entornos-despliegue.md)).  
3. `docker compose … ps` / restart / `up -d`.  
4. Verificar `GET /api/health`.

## Escenario 2 — Fallo de base de datos

Scripts #150. **Sin** failover de réplica documentado.

1. Detener escritores.  
2. Restaurar artefacto: `npm run backup:postgres:restore -- --file … --db <restore_db> --yes`.  
3. Validar; apuntar `DATABASE_URL`; levantar API.  
4. Registrar RTO en [SEC-015](../certificacion-iso/sec/sec-015-evidencias-prueba-restauracion.md).

**Límite:** restore lógico de BD completa — **no** granular por tabla automatizado.

## Escenario 3 — Fallo total del proveedor de hosting

1. Declarar desastre; avisar clientes.  
2. Provisionar host (DNS/TLS operador).  
3. Docker + secretos; restore offsite; migraciones.  
4. DNS; health; login smoke. Practicar en staging.

## Escenario 4 — Borrado accidental

1. Detener escrituras.  
2. Restore a BD lateral (`--db`); extraer datos con Eng.  
3. O rollback completo con aprobación.  
4. Documentar en SEC-015.

## Escenario 5 — Compromiso de seguridad

1. [respuesta-a-incidentes.md](respuesta-a-incidentes.md).  
2. Rotar secretos.  
3. Rebuild; restore desde backup **limpio**.  
4. Notificaciones legales/clientes; post-mortem.

## Reconciliación de evidencia (#449 vs #197) — 2026-11-08

| Ítem | Evidencia | ¿Cierra AC #197? |
|------|-----------|------------------|
| Drill de integridad local (`pnpm run backup:postgres:drill`) | Fila SEC-015 2026-11-07; [backup-y-restauracion.md](backup-y-restauracion.md) | **No** |
| Drill DR staging / remoto | Host pendiente (`STAGING_DEPLOY_*`); precondición `pnpm run dr:staging:check` | **Requerido** — abierto |
| Status page first-party (`/status`) | En repo (`apps/web/src/pages/status/`) | **Evidenciado en repo** — URL pública desplegada + monitor externo pendientes |
| Monitor externo de uptime | [uptime-monitor-register.md](../../evidence/uptime-monitor-register.md) | **Requerido** — registro vacío |
| Contactos de emergencia | Plantilla | **No** — completar ops |

## Drill semestral staging — AC pendiente

**Precondición:** `pnpm run dr:staging:check` solo sale 0 si están `STAGING_DEPLOY_HOST`, `STAGING_DEPLOY_USER`, `STAGING_DEPLOY_SSH_KEY` y `STAGING_DEPLOY_PATH` (mismo fail-closed que staging.yml). Sin ellas sale ≠0 e imprime el checklist — **no** afirma drill completado.

Checklist cronometrado (no marcar completo sin evidencia de reloj de pared):

1. Confirmar host staging con `STAGING_DEPLOY_*` ([entornos-despliegue.md](entornos-despliegue.md)); ejecutar `pnpm run dr:staging:check`.
2. Registrar hora de inicio (UTC); snapshot/backup.
3. Simular fallo (detener app/DB solo en staging).
4. Restaurar desde backup; redesplegar; verificar `/api/health` y `/status`.
5. Registrar hora de fin; calcular RTO; comparar con &lt; 4 h.
6. Añadir fila SEC-015 con RTO medido.
7. **#197 permanece OPEN** hasta este drill **y** una entrada live en [uptime-monitor-register.md](../../evidence/uptime-monitor-register.md).

Smoke Docker local / drill #449 en SEC-015 **no** cierra ese AC. [`docker-compose.staging.yml`](../../../docker-compose.staging.yml) es **práctica local** — **no** es el AC staging remoto.

## Relacionado

- [SLA](sla.md)
- [Registro de monitor de uptime](../../evidence/uptime-monitor-register.md)
- [Backup y restauración](backup-y-restauracion.md)
- [SEC-014](../certificacion-iso/sec/sec-014-continuidad-recuperacion.md)

## Otros idiomas

- English: [disaster-recovery.md](../../en/quality/disaster-recovery.md)
- Português: [recuperacao-de-desastres.md](../../pt-br/quality/recuperacao-de-desastres.md)

## Historial

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-08-25 | BizCode | Runbooks DR iniciales #197 |
| 0.2 | 2026-11-08 | BizCode | Gaps explícitos #449 vs staging/status para #197 |
| 0.3 | 2026-11-11 | BizCode | `/status` first-party + checklist drill staging cronometrado; registro de monitor vacío |
| 0.4 | 2026-11-12 | BizCode | `dr:staging:check` fail-closed; `/status` evidenciado en repo; compose.staging = práctica local |
