# Registro de riesgos

| Código de documento | RSK-002 |
| Versión | 0.2 |
| Fecha | 2026-08-25 |
| Autor | BizCode |
| Nivel de requisito | Obligatorio |
| Aplicabilidad normativa | ISO 9001:2015; ISO/IEC 27001:2022; ISO/IEC 20000-1:2018; ISO/IEC 42001:2023 |
| Estado de evidencia | Parcial — riesgos críticos iniciales #196 (≥10) |

## Declaración de fuera de alcance

Registro ISO-ready del alcance SGSI de producto BizCode. No afirma certificación.

## Propósito

Registrar los riesgos de seguridad de la información más críticos a partir del gap Anexo A y del modelo de amenazas de producto.

## Escala

| Valor | Probabilidad | Impacto |
|-------|--------------|---------|
| L / M / H | Baja / Media / Alta | Bajo / Medio / Alto |

## Registro (≥10 riesgos críticos)

| ID | Riesgo | L | I | Dueño | Anexo A / control | Evidencia / notas |
|----|--------|---|---|-------|-------------------|-------------------|
| R-01 | IDOR cross-tenant / control de acceso roto | M | H | Ingeniería | A.8.3, A.5.15 | RBAC parcial; foco pentest [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-02 | Secretos/tokens en logs o artefactos CI | M | H | Ingeniería | A.8.12, A.8.15 | Redacción + `check:logs`; sinks de ops pendientes |
| R-03 | Dependencia High+ sin parche | M | H | Ingeniería | A.8.8, A.5.21 | `pnpm audit` + Snyk; triage #219 |
| R-04 | Sin revisión de seguridad independiente antes del lanzamiento | H | H | Product owner | A.5.35, A.8.29 | Registro pentest vacío; #194 OPEN |
| R-05 | Fallo de restore / DR no probado | M | H | Ops plataforma | A.8.13, A.5.30 | Scripts #150; **smoke local** SEC-015 (2026-08-25); drill staging pendiente [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-06 | Confusión staging/producción (DB/secretos) | M | H | Ops plataforma | A.8.31, A.8.9 | Docs #152; error humano residual |
| R-07 | Compromiso SuperAdmin / bootstrap | L | H | Product owner | A.8.2, A.5.17 | Passwords solo en env |
| R-08 | Cumplimiento incompleto de privacidad / titular | M | M | Product owner | A.5.34 | Docs #195 |
| R-09 | Compromiso supply-chain (npm / Actions) | M | H | Ingeniería | A.5.21 | Lockfile + audit; SBOM generado |
| R-10 | Exposición SaaS sin TLS / WAF mal configurado | M | H | Ops plataforma | A.8.20, A.5.23 | Helmet/CORS; Cloudflare #217 |
| R-11 | Brecha de continuidad (sin SLA / RTO no probado) | H | H | Product owner | A.5.29, A.5.30 | Docs SLA/DR (#197); **uptime público + RTO staging** siguen abiertos |
| R-12 | Concienciación insuficiente de operadores | M | M | Product owner | A.6.3 | Sin registros de formación |

Tratamiento: [RSK-004](rsk-004-plan-tratamiento-riesgos.md). Contexto: [gap Anexo A](../../quality/analisis-brechas-anexo-a-iso27001.md).

## Historial de revisiones

| Versión | Fecha | Autor | Resumen |
|---------|-------|-------|---------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | ≥12 riesgos iniciales #196 |
