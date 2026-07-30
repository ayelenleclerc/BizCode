# Política de privacidade

| Código do documento | PRV-001 |
| Versão | 0.2 |
| Data | 2026-07-30 |
| Autor | BizCode |
| Nível de requisito | Conforme aplicável |
| Aplicabilidade normativa | ISO/IEC 27701:2019 |
| Estado de evidência | Parcial — tooling de produto evidenciado (#195); registro AAIP pendente do operador |

## Declaração de fora de escopo

Este documento descreve controles de privacidade do produto BizCode sobre dados de clientes. Não afirma certificação ISO/IEC 27701.


## Propósito

Definir como os dados pessoais de clientes (`Cliente`) são inventariados, acessados, retificados e anonimizados no BizCode, e remeter ao operador as obrigações de registro AAIP.

## Evidência de produto (#195)

Narrativa operacional (trilingue): [Privacidade e direitos do titular](../../quality/privacidade-e-direitos-do-titular.md).

UI pública: `/privacidad`. APIs: `GET /api/clientes/{id}/exportar-datos`, `POST /api/clientes/{id}/anonimizar`. Inventário: [mapa-dados-pessoais.md](../../mapa-dados-pessoais.md).

## Histórico de revisões

| Versão | Data | Autor | Resumo das mudanças |
|--------------|-----------|-------------|----------------|
| 0.2 | 2026-07-30 | BizCode | Evidência de produto #195 |
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
