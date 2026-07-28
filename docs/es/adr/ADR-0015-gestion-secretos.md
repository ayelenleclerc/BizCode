# ADR-0015: Gestión de secretos (inyección Doppler + HMAC dual)

**Estado:** Aceptado  
**Fecha:** 2026-07-28  
**Referencia ISO:** ISO/IEC 27001:2022 A.5.10 (uso aceptable de la información); A.8.24 (criptografía); A.5.15 (control de acceso)

---

## Contexto

BizCode cargaba secretos solo desde el entorno / `.env` local (`DATABASE_URL`, `JWT_SECRET`, claves AES fiscal/MFA). Las credenciales AFIP y Mercado Pago en reposo ya usan AES-256-GCM ([`fiscalSecrets.ts`](../../../apps/server/fiscal/ar/fiscalSecrets.ts)); MFA usa clave dedicada ([`mfaSecrets.ts`](../../../apps/server/lib/mfaSecrets.ts)). El issue #216 exige que en producción no vivan en `.env` versionados, rotación HMAC sin reinicio simultáneo de todas las instancias, y escaneo de secretos en CI.

Pese al nombre histórico `JWT_SECRET`, los tokens de sesión y portal son valores **opacos** hasheados con HMAC-SHA256, no JWT firmados.

## Decisión

1. **Fuente en producción = Doppler (opción A del issue):** Doppler (u orquestador equivalente) **inyecta** secretos en el entorno del proceso al arrancar. La app Node **no** incorpora SDK de AWS Secrets Manager / Vault en v1; sigue leyendo env validado con [`loadAppConfig`](../../../apps/server/config/env.ts).
2. **Local / test / CI:** `.env` (gitignored) y `env:` de GitHub Actions siguen válidos. Nunca commitear valores reales de producción; [`.env.example`](../../../.env.example) solo placeholders.
3. **Rotación HMAC sin downtime:** `JWT_SECRET` (actual; hashea altas nuevas) y opcional `JWT_SECRET_PREVIOUS`. Las búsquedas prueban candidatos de [`secretHmac.ts`](../../../apps/server/lib/secretHmac.ts) para aceptar tokens hasheados con el secreto anterior hasta que expiren o se renueven.
4. **Claves AES:** `BIZCODE_FISCAL_ENCRYPTION_KEY` y `BIZCODE_MFA_ENCRYPTION_KEY` obligatorias con `NODE_ENV=production` (sin defaults inseguros).
5. **CI:** Gitleaks en push/PR; auditoría de historial `**/.env*` documentada; reescritura BFG fuera de banda.
6. **Fuera de alcance v1:** SDK AWS, Vault, rotación AES automática, WAF (#217).

## Consecuencias

- **Pros:** Producción sin `.env` con secretos reales; rotación gradual de sesiones/portal; CI detecta commits accidentales.
- **Contras:** Hay que configurar Doppler (o inyección equivalente); la ventana del secreto previous debe acotarse.
- **Pruebas:** [`tests/server/lib/secretHmac.test.ts`](../../../../tests/server/lib/secretHmac.test.ts) y endurecimiento de env/fiscal/MFA.

## Referencias

- Issue #216
- [ADR-0007: Despliegue dual y modularidad fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [Gestión de secretos y Doppler](../quality/gestion-secretos-y-doppler.md)
