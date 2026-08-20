# Hardening de apps móveis (#220)

## Propósito

Documenta controles de segurança do **App Entregador** (`apps/driver`) e **App Vendedor** (`apps/seller`): tokens no SecureStore, cache offline cifrado, soft-gate root/jailbreak, certificate pinning TLS no Android, Hermes/minify em release.

**Estado de evidência:** Implementado no código e nos workflows EAS. Não é afirmação de certificação.

## Tokens SecureStore

Ambos apps guardam access/refresh só no `expo-secure-store` (`secureTokenStorage.ts`). Testes unitários fixam as chaves; AsyncStorage não é usado para tokens.

## Cifrado offline

- AES-256-GCM sobre JSON SQLite / outbox (`src/security/offlineCrypto.ts`); chave no SecureStore.
- MMKV com `encryptionKey` e id `*-offline-v2`.
- Wipe one-shot do DB/MMKV em claro na atualização — **sincronizar outbox antes de atualizar** o app.

Residual: colunas de busca denormalizadas do Seller (`rsocial`, `descripcion`) ficam em claro para LIKE; o JSON completo é selado.

## Root / jailbreak

`jail-monkey` (quando o módulo nativo existe) mostra banner e soft-gate em ações sensíveis (POD, cobranças, prestação, confirmar pedido). Não é bloqueio total.

## Certificate pinning (Android)

Plugin [`plugins/withApiTlsPinning.cjs`](../../../plugins/withApiTlsPinning.cjs) grava `network_security_config.xml` se houver `EXPO_PUBLIC_API_TLS_PINS` (SPKI SHA-256 base64, separados por vírgula). Host de `EXPO_PUBLIC_API_TLS_PIN_HOST` ou hostname de `EXPO_PUBLIC_API_BASE_URL`.

| Ambiente | Comportamento |
|----------|---------------|
| Pins vazios | Sem pinning (dev, Expo Go, API localhost / Docker `:5432`) |
| CI EAS por tag | Fail-closed se faltarem secrets de pins/host (`seller-eas.yml` / `driver-eas.yml`) |

**Só builds nativos EAS / dev client — não Expo Go.**

iOS: TrustKit não está ligado nesta entrega; Android é o MVP de distribuição (APK internal).

### Runbook de rotação de pins

1. Extrair o novo SPKI SHA-256 (base64) antes da troca de certificado.
2. Definir `EXPO_PUBLIC_API_TLS_PINS` como **antigo,novo**.
3. Publicar build `internal` EAS e verificar conectividade.
4. Após o rollover, remover o pin antigo no build seguinte.
5. Manter `EXPO_PUBLIC_API_TLS_PIN_EXPIRATION` à frente da próxima rotação.

## Hermes / minify

`app.config.ts` declara `jsEngine: 'hermes'` e minify/shrink Android via `expo-build-properties`.

## Checklist OWASP Mobile Top 10 (evidenciado)

| Risco | Estado no repo |
|-------|----------------|
| M1 Uso indevido da plataforma | SecureStore para tokens |
| M2 Armazenamento inseguro | JSON offline selado; MMKV cifrado; residual documentado |
| M3 Comunicação insegura | Pin-set Android com secrets; vazio no local |
| M4 Autenticação insegura | Bearer + SecureStore existente |
| M5 Criptografia insuficiente | AES-256-GCM; chave no SecureStore |
| M6 Autorização insegura | RBAC do servidor sem mudanças |
| M7 Qualidade do código cliente | Hermes + minify release |
| M8 Manipulação de código | Aviso root/jailbreak (soft) |
| M9 Engenharia reversa | Só minify/Hermes |
| M10 Funcionalidade extra | Sem credenciais AFIP/pagamento no dispositivo |

## Checks manuais (EAS / emulador)

- [ ] APK `internal` com pins; host HTTPS coincide.
- [ ] Pin incorreto → falha TLS.
- [ ] Emulador root → banner + diálogos em POD/cobrança.
- [ ] Após upgrade pré-#220: wipe de cache + re-hydrate online.

## Relacionado

- [Segurança](../seguranca.md)
- [Ambiente local](guia-ambiente-local-desenvolvimento.md)
- [CI/CD](ciclo-ci-cd.md)
