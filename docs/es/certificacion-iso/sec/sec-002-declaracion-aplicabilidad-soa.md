# Declaración de aplicabilidad (SoA)

| Código de documento | SEC-002 |
| Versión | 0.2 |
| Fecha | 2026-08-25 |
| Autor | BizCode |
| Nivel de requisito | Obligatorio |
| Aplicabilidad normativa | ISO/IEC 27001:2022 |
| Estado de evidencia | Parcial — SoA inicial enlazado al gap Anexo A (#196) |

## Declaración de fuera de alcance

Esta SoA apoya la preparación **ISO-ready** de BizCode. **No** afirma certificación ISO/IEC 27001.

## Propósito

Declarar qué controles del Anexo A aplican al alcance SGSI de producto BizCode, enlazar el análisis de brechas y registrar exclusiones de alto nivel.

## Análisis de brechas canónico

Estado control a control: [Análisis de brechas Anexo A](../../quality/analisis-brechas-anexo-a-iso27001.md).

## Alcance SGSI

| En alcance | Fuera de alcance (actual) |
|------------|---------------------------|
| Software BizCode (API, web, escritorio, apps móviles documentadas) | Instalaciones físicas del operador (Anexo A.7) |
| Controles de ingeniería en este repositorio y GitHub Actions | Procesos RR.HH. de empleo (mayor parte de A.6) |
| Procedimientos documentados bajo `docs/` | Certificación externa Stage 1/2 |

## Resumen de aplicabilidad

| Tema | ¿Aplica? | Notas |
|------|----------|-------|
| A.5 Organizacional | En su mayoría sí | Muchos Partial / Not evidenced — ver gap |
| A.6 Personas | Limitado | Concienciación/reporte Partial; screening/empleo N/A |
| A.7 Físico | No (N/A) | Hosting/oficina = proveedor/operador |
| A.8 Tecnológico | Sí | Mejor evidencia de producto; BC/redundancia → #197 |

## Exclusiones (justificadas)

1. **A.7.1–A.7.14** — BizCode no opera instalaciones físicas dedicadas en el repo.
2. **A.6.1, A.6.2, A.6.4, A.6.6** — Procesos laborales/RR.HH. fuera del repositorio de producto.
3. **A.8.23 Filtrado web** — No es control de producto BizCode.

## Documentos controlados relacionados

- [SEC-001 Política de seguridad de la información](sec-001-politica-seguridad-informacion.md)
- [RSK-002 Registro de riesgos](../rsk/rsk-002-registro-riesgos.md)
- [RSK-004 Plan de tratamiento](../rsk/rsk-004-plan-tratamiento-riesgos.md)

## Historial de revisiones

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | SoA inicial #196; enlace al gap Anexo A |
