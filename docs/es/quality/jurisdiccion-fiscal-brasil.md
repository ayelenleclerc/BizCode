# Brasil como jurisdicción fiscal (#211)

## Propósito

Agrega Brasil (`BR`) al registro de reglas fiscales por país de [#440](https://github.com/ayelenleclerc/BizCode/issues/440). Ver [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md) y [ADR-0027](../adr/ADR-0027-brazil-sefaz-nfe-mock.md).

## Reglas declaradas

| Aspecto | Valor |
| --- | --- |
| Moneda | BRL |
| Identificador fiscal | CNPJ (14 dígitos, dos verificadores módulo 11) |
| Cuenta bancaria | ninguna evidenciada |
| IVA (modelo de producto) | estándar 18%; reducido 12% — **no** la matriz real de ICMS |
| Tipos de documento | `55-NFe`, `NFe-Devolucao` (modelo de producto) |
| Proveedor | `brazil_sefaz_nfe` — **mock de homologación** (ADR-0027); SEFAZ live Not evidenced |
| Módulo | `billing.nfe_sefaz` (`availableForCountries: ['BR']`) |
| Cancelación | Not evidenced (`supportsCancel: false`) |

## Límites de evidencia

- Catálogos oficiales de Receita Federal / SEFAZ **no** están en este repositorio.
- Condiciones de sujeto (`Contribuinte` / `NaoContribuinte` / `Isento`) son modelo de producto.
- Simples Nacional, ICMS-ST, IPI, PIS/COFINS, DANFE PDF y autorización SEFAZ live siguen **Not evidenced**.
- Los dos buckets de `Factura` no expresan el multi-impuesto brasileño completo (#440).

## Relacionado

- [#211](https://github.com/ayelenleclerc/BizCode/issues/211), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Conjuntos de reglas fiscales por país](conjuntos-reglas-fiscales-por-pais.md)
