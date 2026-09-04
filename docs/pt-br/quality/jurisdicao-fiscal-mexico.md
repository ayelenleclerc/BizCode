# México como jurisdição fiscal (#210)

## Propósito

Adiciona o México (`MX`) ao registro de regras fiscais por país de [#440](https://github.com/ayelenleclerc/BizCode/issues/440). Ver [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).

## Regras declaradas

| Aspecto | Valor |
| --- | --- |
| Moeda | MXN |
| Identificador | RFC (moral 12 / física 13) com dígito verificador módulo 11 |
| Conta bancária | nenhuma evidenciada |
| IVA | padrão 16%; bucket reduzido 0% (alimentos e medicamentos) |
| Taxa fronteiriça 8% | residual — depende da localização do estabelecimento |
| Letras de comprovante | nenhuma |
| Provedor | `mexico_sat_pac` (stub; timbragem CFDI 4.0 não implementada) |

## Limites de evidência

- Os catálogos oficiais do SAT e os contratos com PAC **não** estão neste repositório.
- As condições fiscais do sujeito são um modelo de produto (quem paga IVA).
- A timbragem real exige PAC autorizado e certificado digital — o adapter permanece sem implementação.

## Relacionados

- [#210](https://github.com/ayelenleclerc/BizCode/issues/210), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Conjuntos de regras fiscais por país](conjuntos-regras-fiscais-por-pais.md)
