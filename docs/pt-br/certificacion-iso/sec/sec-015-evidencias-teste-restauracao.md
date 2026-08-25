# Registro de evidências de teste de restauração

| Código do documento | SEC-015 |
| Versão | 0.2 |
| Data | 2026-08-25 |
| Autor | BizCode |
| Nível de requisito | Altamente recomendado |
| Aplicabilidade normativa | ISO/IEC 27001:2022 |
| Estado de evidência | Parcial — smoke restore Docker local; drill staging pendente (#197) |

## Declaração de fora de escopo

Um **smoke local** **não** satisfaz o AC de drill staging de [#197](https://github.com/ayelenleclerc/BizCode/issues/197).

## Propósito

Registrar exercícios de restore cronometrados (local e staging) frente a RTO &lt; 4 h.

## Entradas

| Data (UTC) | Ambiente | Tipo | Artefato | BD destino | Tempo restore | RTO vs &lt;4h | Operador | Notas |
|------------|----------|------|----------|------------|---------------|-------------|----------|-------|
| 2026-08-25T16:00:47Z | Docker local `bizcode_db` `:5432` | Smoke local | `bizcode-pg-bizcode_dev-20260825T160047Z.sql.gz.enc` | `bizcode_restore_smoke_197` (removida) | Backup ~1.8 s; restore ~2.8 s; total ~5.4 s | Cumpre (só path) | Agente Eng (#197) | Chave efêmera; **não** staging; não fecha AC #197 |
| _(pendente)_ | Staging remoto | Drill semestral | _(pendente)_ | _(pendente)_ | _(pendente)_ | _(pendente)_ | _(pendente)_ | Requer host `STAGING_DEPLOY_*` |

## Histórico

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | Linha smoke local #197 |
