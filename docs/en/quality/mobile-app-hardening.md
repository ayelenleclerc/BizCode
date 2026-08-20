# Mobile app hardening (#220)

## Purpose

Documents security controls for **App Driver** (`apps/driver`) and **App Seller** (`apps/seller`): SecureStore tokens, encrypted offline cache, root/jailbreak soft-gate, Android TLS certificate pinning, and Hermes/minify release settings.

**Evidence status:** Implemented in product code and EAS workflows. Not a certification claim.

## SecureStore tokens

Both apps store Bearer access/refresh tokens only in `expo-secure-store` (`secureTokenStorage.ts`). Unit tests assert SecureStore keys; AsyncStorage is not used for tokens.

## Offline encryption

- AES-256-GCM over SQLite JSON / outbox payloads (`src/security/offlineCrypto.ts`); key in SecureStore.
- MMKV metadata uses `encryptionKey` with storage id `*-offline-v2`.
- One-shot wipe of legacy cleartext DB/MMKV on first run after upgrade — **sync outbox before updating** the app.

Residual: Seller denormalized search columns (`rsocial`, `descripcion`) remain plaintext for LIKE queries; full entity JSON is sealed.

## Root / jailbreak

`jail-monkey` (when native module is present) sets a banner and soft-gates sensitive actions (POD confirm, cobros, remittance, seller order confirm). Not a hard block.

## Certificate pinning (Android)

Plugin [`plugins/withApiTlsPinning.cjs`](../../../plugins/withApiTlsPinning.cjs) writes `network_security_config.xml` when `EXPO_PUBLIC_API_TLS_PINS` is set (comma-separated SPKI SHA-256 base64). Host from `EXPO_PUBLIC_API_TLS_PIN_HOST` or hostname of `EXPO_PUBLIC_API_BASE_URL`.

| Environment | Behavior |
|-------------|----------|
| Empty pins | No pinning (dev, Expo Go, API on localhost / Docker `:5432`) |
| EAS tag CI | Fail-closed if pins (and host) secrets missing (`seller-eas.yml` / `driver-eas.yml`) |

**Applies to EAS / development client native builds only — not Expo Go.**

iOS: pin enforcement via TrustKit is not wired in this delivery; Android is the MVP distribution path (internal APK). Document rotation still applies when iOS pins are added later.

### Pin rotation runbook

1. Extract new leaf/intermediate SPKI SHA-256 (base64) before certificate change.
2. Set `EXPO_PUBLIC_API_TLS_PINS` to **old,new** (both pins in the pin-set).
3. Ship an `internal` EAS build; verify devices still connect.
4. After the server certificate rolls over, remove the old pin in a follow-up build.
5. Keep `EXPO_PUBLIC_API_TLS_PIN_EXPIRATION` ahead of the next expected rotation.

## Hermes / minify

`app.config.ts` sets `jsEngine: 'hermes'` and `expo-build-properties` Android `enableMinifyInReleaseBuilds` / `enableShrinkResourcesInReleaseBuilds`.

## OWASP Mobile Top 10 checklist (evidenced)

| Risk | Status in repo |
|------|----------------|
| M1 Improper platform usage | SecureStore for tokens; field channel headers unchanged |
| M2 Insecure data storage | Offline JSON sealed; MMKV encrypted; residual plaintext search columns documented |
| M3 Insecure communication | Android TLS pin-set when secrets present; empty pins for local HTTP |
| M4 Insecure authentication | Existing Bearer + SecureStore; MFA remains web-oriented |
| M5 Insufficient cryptography | AES-256-GCM via Web Crypto; key material in SecureStore |
| M6 Insecure authorization | Unchanged server RBAC |
| M7 Client code quality | Hermes + release minify declared |
| M8 Code tampering | Soft root/jailbreak warning (not anti-tamper DRM) |
| M9 Reverse engineering | Minify/Hermes only; no claim of strong obfuscation |
| M10 Extraneous functionality | No AFIP/payment credentials cached on device |

## Manual checks (EAS / emulator)

- [ ] Install `internal` APK with pins configured; API HTTPS host matches pin host.
- [ ] Wrong pin → TLS failure (expected).
- [ ] Rooted emulator → integrity banner + confirm dialogs on POD/cobro.
- [ ] After upgrade from pre-#220: offline cache wiped; re-hydrate when online.

## Related

- [Security](../security.md)
- [Local development setup](local-development-setup.md)
- [CI/CD](ci-cd.md) (Seller/Driver EAS workflows)
