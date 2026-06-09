# Impressão POS opcional (hardware opt-in)

**Relacionado:** GitHub [#153](https://github.com/ayelenleclerc/BizCode/issues/153) (Fase 1 mock no PR #311), [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md), [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md).

## Princípio

Controladores fiscais e impressoras térmicas 80 mm são **opcionais por cliente**. Não são obrigatórios para emitir faturas, obter CAE ou baixar PDF legal.

| Capacidade | Obrigatória? | Padrão |
|------------|--------------|--------|
| PDF legal / fatura eletrônica (fluxo CAE AFIP) | Sim (baseline) | Sempre disponível |
| Impressora fiscal (Hasar/Epson/Olivetti, RS-232/USB) | Não | Desligado (`FISCAL_PRINTER_ENABLED=false`) |
| Térmica 80 mm (ESC/POS) | Não | Desligado (`THERMAL_PRINTER_ENABLED=false`) |

## Configuração no servidor

Variáveis no **host de implantação** (`.env`):

- `FISCAL_PRINTER_ENABLED=true` — opt-in ao canal fiscal (Fase 1: mock; Fase 2: hardware real).
- `THERMAL_PRINTER_ENABLED=true` — opt-in ao canal térmico (Fase 1: mock; Fase 2: ESC/POS).

Com dispositivo desabilitado, `POST /api/facturas/{id}/print` e `POST /api/printing/test` retornam `fallbackToPdf: true` e `downloadPath` para o PDF legal quando aplicável.

## API e UI

- `GET /api/printing/status` expõe `fiscalPrinterEnabled` e `thermalPrinterEnabled`.
- **Faturamento** mostra ações fiscal/térmica só com o flag ativo; **PDF legal** sempre visível.
- **Configuração → Dispositivos de impressão** documenta opt-in e oculta testes se ambos os flags forem false.

## Fase 2 (futuro, por cliente)

Drivers reais somente com hardware e critérios de aceite do cliente. Issue de backlog dedicada; não bloquear tenants sem PDV.

## Validação

```bash
npm run check:openapi && npm run check:openapi-sync
npm run test -- tests/api/printing-status.test.ts tests/api/factura-print.test.ts
```
