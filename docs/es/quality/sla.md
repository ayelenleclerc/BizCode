# Acuerdo de nivel de servicio (SLA) — BizCode SaaS (#197)

**Rol:** Plantilla contractual de SLA para BizCode hospedado (ISO-ready).  
**Issue:** [#197](https://github.com/ayelenleclerc/BizCode/issues/197)  
**Hub:** [docs/SLA.md](../../SLA.md)

Define **objetivos** de servicio para despliegues **SaaS/hosted**. Escritorio local queda fuera del compromiso de uptime. Los valores **no** son evidencia de medición en vivo hasta activar monitoreo público.

**Aviso legal:** Cláusulas de penalidades/jurisdicción son **plantilla** orientada a AR; requieren revisión legal antes de firmar. No es asesoramiento jurídico.

## Descripción del servicio

Software multi-tenant BizCode (API + UI web) según suscripción. Quedan fuera fallos de terceros (AFIP/ARCA, Mercado Pago, DNS/CDN no controlados por BizCode), salvo mala configuración de BizCode.

## Métricas objetivo

| Métrica | Objetivo | Cómo medir (ops) | Estado de evidencia |
|---------|----------|------------------|---------------------|
| Uptime mensual | 99.9% (~43.8 min/mes) | Monitor HTTP(S) a `/api/health` + status page | **No evidenciado** — activación pendiente |
| API P95 | &lt; 500 ms | Métricas de app (#151) | Parcial |
| Primera respuesta soporte | P1 &lt; 4 hs hábiles; P2 &lt; 24 hs | Tickets (operador) | **No evidenciado** |
| RTO | &lt; 4 hs | Drill de restore | Smoke local: [SEC-015](../certificacion-iso/sec/sec-015-evidencias-prueba-restauracion.md); staging **pendiente** |
| RPO | &lt; 24 hs | Backup diario | Parcial — [backup-y-restauracion.md](backup-y-restauracion.md) |

Horario hábil por defecto: lun–vie 09:00–18:00 America/Argentina/Buenos_Aires.

## Exclusiones

Mantenimiento anunciado (≥48 h), fuerza mayor, error del cliente/red, fallos de terceros fuera de control, features beta, trials (salvo contrato).

## Créditos / penalidades (plantilla)

| Uptime (mes) | Crédito (% cuota mensual) |
|--------------|---------------------------|
| 99.0% – &lt; 99.9% | 10% |
| 95.0% – &lt; 99.0% | 25% |
| &lt; 95.0% | 50% |

Único remedio bajo esta plantilla salvo que el MSA diga otra cosa. Tope 50%/mes. Reclamo en 30 días con evidencia del monitor.

## Jurisdicción (plantilla)

Ley argentina; tribunales CABA salvo MSA. **Confirmar con asesoría legal.**

## Activación de monitoreo público (checklist ops)

1. Monitor UptimeRobot (o equiv.) a `GET https://<prod>/api/health` cada 5 min.  
2. Status page pública.  
3. Registrar URLs en contactos de emergencia.  
4. No afirmar “monitoreo público activo” hasta completar 1–3.

## Relacionado

- [Recuperación ante desastres](recuperacion-ante-desastres.md)
- [Entornos de despliegue](entornos-despliegue.md)
- [SRV-003](../certificacion-iso/srv/srv-003-catalogo-sla.md)

## Otros idiomas

- English: [sla.md](../../en/quality/sla.md)
- Português: [sla.md](../../pt-br/quality/sla.md)

## Historial

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-08-25 | BizCode | Plantilla SLA inicial #197 |
