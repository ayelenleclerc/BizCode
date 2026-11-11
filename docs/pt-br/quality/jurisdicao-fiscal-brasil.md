# Brasil como jurisdição fiscal (#211)

## Propósito

Adiciona o Brasil (`BR`) ao registro de regras fiscais por país de [#440](https://github.com/ayelenleclerc/BizCode/issues/440). Ver [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md) e [ADR-0027](../adr/ADR-0027-brazil-sefaz-nfe-mock.md).

## Regras declaradas

| Aspecto | Valor |
| --- | --- |
| Moeda | BRL |
| Identificador fiscal | CNPJ (14 dígitos, dois verificadores módulo 11) |
| Conta bancária | nenhuma evidenciada |
| IVA (modelo de produto) | padrão 18%; reduzido 12% — **não** a matriz real de ICMS |
| Tipos de documento | `55-NFe`, `NFe-Devolucao` (modelo de produto) |
| Provedor | `brazil_sefaz_nfe` — **mock de homologação** (ADR-0027); SEFAZ live Not evidenced |
| Módulo | `billing.nfe_sefaz` (`availableForCountries: ['BR']`) |
| Cancelamento | Not evidenced (`supportsCancel: false`) |

## Limites de evidência

- Catálogos oficiais da Receita Federal / SEFAZ **não** estão neste repositório.
- Condições de sujeito (`Contribuinte` / `NaoContribuinte` / `Isento`) são modelo de produto.
- Simples Nacional, ICMS-ST, IPI, PIS/COFINS, DANFE PDF e autorização SEFAZ live permanecem **Not evidenced**.
- Os dois buckets de `Factura` não expressam o multi-imposto brasileiro completo (#440).

## Relacionado

- [#211](https://github.com/ayelenleclerc/BizCode/issues/211), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Conjuntos de regras fiscais por país](conjuntos-regras-fiscais-por-pais.md)
