# Hardening de apps móviles (#220)

## Propósito

Documenta controles de seguridad de **App Repartidor** (`apps/driver`) y **App Vendedor** (`apps/seller`): tokens en SecureStore, cache offline cifrado, soft-gate root/jailbreak, certificate pinning TLS en Android, Hermes/minify en release.

**Estado de evidencia:** Implementado en código y workflows EAS. No es afirmación de certificación.

## Tokens SecureStore

Ambas apps guardan access/refresh solo en `expo-secure-store` (`secureTokenStorage.ts`). Tests unitarios fijan las claves; no se usa AsyncStorage para tokens.

## Cifrado offline

- AES-256-GCM sobre JSON SQLite / outbox (`src/security/offlineCrypto.ts`); clave en SecureStore.
- MMKV con `encryptionKey` e id `*-offline-v2`.
- Wipe one-shot del DB/MMKV en claro al actualizar — **sincronizar outbox antes de actualizar** la app.

Residual: columnas de búsqueda denormalizadas del Seller (`rsocial`, `descripcion`) quedan en claro para LIKE; el JSON completo va sellado.

## Root / jailbreak

`jail-monkey` (si el módulo nativo está presente) muestra banner y soft-gate en acciones sensibles (POD, cobros, rendición, confirmar pedido). No es bloqueo total.

## Certificate pinning (Android)

Plugin [`plugins/withApiTlsPinning.cjs`](../../../plugins/withApiTlsPinning.cjs) escribe `network_security_config.xml` si hay `EXPO_PUBLIC_API_TLS_PINS` (SPKI SHA-256 base64, separados por coma). Host desde `EXPO_PUBLIC_API_TLS_PIN_HOST` o hostname de `EXPO_PUBLIC_API_BASE_URL`.

| Entorno | Comportamiento |
|---------|----------------|
| Pins vacíos | Sin pinning (dev, Expo Go, API localhost / Docker `:5432`) |
| CI EAS por tag | Fail-closed si faltan secrets de pins/host (`seller-eas.yml` / `driver-eas.yml`) |

**Solo builds nativos EAS / dev client — no Expo Go.**

iOS: TrustKit no está cableado en esta entrega; Android es el MVP de distribución (APK internal).

### Runbook de rotación de pins

1. Extraer el nuevo SPKI SHA-256 (base64) antes del cambio de certificado.
2. Poner `EXPO_PUBLIC_API_TLS_PINS` en **viejo,nuevo**.
3. Publicar build `internal` EAS y verificar conectividad.
4. Tras el rollover del certificado, quitar el pin viejo en un build siguiente.
5. Mantener `EXPO_PUBLIC_API_TLS_PIN_EXPIRATION` por delante de la próxima rotación.

## Hermes / minify

`app.config.ts` declara `jsEngine: 'hermes'` y minify/shrink Android vía `expo-build-properties`.

## Checklist OWASP Mobile Top 10 (evidenciado)

| Riesgo | Estado en el repo |
|--------|-------------------|
| M1 Uso indebido de plataforma | SecureStore para tokens |
| M2 Almacenamiento inseguro | JSON offline sellado; MMKV cifrado; residual documentado |
| M3 Comunicación insegura | Pin-set Android con secrets; vacío en local |
| M4 Autenticación insegura | Bearer + SecureStore existente |
| M5 Criptografía insuficiente | AES-256-GCM; clave en SecureStore |
| M6 Autorización insegura | RBAC de servidor sin cambios |
| M7 Calidad de código cliente | Hermes + minify release |
| M8 Manipulación de código | Advertencia root/jailbreak (soft) |
| M9 Ingeniería inversa | Solo minify/Hermes |
| M10 Funcionalidad extra | Sin credenciales AFIP/pago en dispositivo |

## Checks manuales (EAS / emulador)

- [ ] APK `internal` con pins; host HTTPS coincide.
- [ ] Pin incorrecto → fallo TLS.
- [ ] Emulador root → banner + diálogos en POD/cobro.
- [ ] Tras upgrade pre-#220: cache wipe + re-hydrate online.

## Relacionado

- [Seguridad](../seguridad.md)
- [Entorno local](guia-entorno-local-desarrollo.md)
- [CI/CD](ciclo-ci-cd.md)
