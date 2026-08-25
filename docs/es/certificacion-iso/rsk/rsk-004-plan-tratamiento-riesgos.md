# Plan de tratamiento de riesgos

| Código de documento | RSK-004 |
| Versión | 0.2 |
| Fecha | 2026-08-25 |
| Autor | BizCode |
| Nivel de requisito | Obligatorio |
| Aplicabilidad normativa | ISO 9001:2015; ISO/IEC 27001:2022; ISO/IEC 20000-1:2018; ISO/IEC 42001:2023 |
| Estado de evidencia | Parcial — plan de acción inicial #196 |

## Declaración de fuera de alcance

Plan ISO-ready. No afirma certificación ni garantiza fechas de proveedores externos.

## Propósito

Definir acciones para reducir riesgos de [RSK-002](rsk-002-registro-riesgos.md), con dueños, ventanas objetivo e issues enlazados.

## Opciones de tratamiento

Mitigar · Aceptar · Transferir · Evitar (por fila).

## Plan de acción

| ID riesgo | Tratamiento | Acción | Dueño | Objetivo | Enlace |
|-----------|-------------|--------|-------|----------|--------|
| R-01 | Mitigar | Mantener IDOR/tenant en alcance de pentest; remediar Critical/High | Ingeniería | Tras informe #194 | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-02 | Mitigar | Mantener `check:logs` / redacción; revisar sinks de producción | Ingeniería + Ops | Antes del lanzamiento comercial | Política de sanitización de logs |
| R-03 | Mitigar | Mantener `pnpm audit` High+ bloqueante; triage #219 | Ingeniería | Continuo | Escaneo de dependencias |
| R-04 | Mitigar | Contratar pentest externo; archivar informe | Product owner | Antes del lanzamiento comercial | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-05 | Mitigar | Smoke local hecho (SEC-015); ejecutar drill staging; registrar RTO | Ops plataforma | Host staging listo | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-06 | Mitigar | Seguir guards de entornos; no apuntar tools de staging a prod | Ops plataforma | Continuo | Docs #152 |
| R-07 | Mitigar | Rotar passwords bootstrap/seed por entorno | Product owner | Continuo | seguridad.md |
| R-08 | Mitigar | Operar proceso de privacidad según #195 | Product owner | Continuo | #195 |
| R-09 | Mitigar | Fijar Actions; revisar SBOM; bloquear deps High+ | Ingeniería | Continuo | CI / SBOM |
| R-10 | Mitigar | Forzar TLS + WAF en edges hosted | Ops plataforma | Antes de SaaS GA | #217 |
| R-11 | Mitigar | Docs SLA/DR publicados; activar status page; completar drill staging | Product owner | AC restantes #197 | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-12 | Mitigar | Briefing de concienciación a operadores; registro de asistencia | Product owner | 90 días tras merge #196 | RR.HH. / ops |

## Temas de brecha cerrados por este issue (#196)

- Gap Anexo A documentado.
- SoA inicial (SEC-002).
- Sección política SGSI (SEC-001 / seguridad.md).
- Registro de riesgos + este plan.

## Historial de revisiones

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | Acciones de tratamiento iniciales #196 |
