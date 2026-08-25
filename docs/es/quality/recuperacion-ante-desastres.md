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

## Drill semestral staging — AC pendiente

#197 permanece **OPEN** hasta drill staging + monitoreo público. Smoke Docker local en SEC-015 no cierra ese AC.

## Relacionado

- [SLA](sla.md)
- [Backup y restauración](backup-y-restauracion.md)
- [SEC-014](../certificacion-iso/sec/sec-014-continuidad-recuperacion.md)

## Otros idiomas

- English: [disaster-recovery.md](../../en/quality/disaster-recovery.md)
- Português: [recuperacao-de-desastres.md](../../pt-br/quality/recuperacao-de-desastres.md)

## Historial

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-08-25 | BizCode | Runbooks DR iniciales #197 |
