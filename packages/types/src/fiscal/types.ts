/**
 * @en Contract every country fills in to declare its own tax rules (#440). The core reads this
 *   registry instead of hardcoding Argentine codes such as `CF`, `RI` or the invoice letter `B`.
 * @es Contrato que cada pais completa para declarar sus propias reglas fiscales (#440). El nucleo
 *   lee este registro en vez de cablear codigos argentinos como `CF`, `RI` o la letra `B`.
 * @pt-BR Contrato que cada pais preenche para declarar suas proprias regras fiscais (#440). O nucleo
 *   le este registro em vez de fixar codigos argentinos como `CF`, `RI` ou a letra `B`.
 *
 * @en Rationale in ADR-0023 and ADR-0007 point 3: fiscal behaviour organised as layers per country.
 * @es Fundamento en ADR-0023 y ADR-0007 punto 3: comportamiento fiscal organizado por pais.
 * @pt-BR Fundamento no ADR-0023 e no ADR-0007 ponto 3: comportamento fiscal organizado por pais.
 */

/**
 * @en Kind of tax identifier a jurisdiction expects. It is a user-facing label only: Uruguay and
 *   Chile both call it `rut` but run different algorithms, so the algorithm is chosen by country.
 * @es Tipo de identificador fiscal que espera la jurisdiccion. Es solo una etiqueta de interfaz:
 *   Uruguay y Chile lo llaman `rut` pero usan algoritmos distintos, que se eligen por pais.
 * @pt-BR Tipo de identificador fiscal esperado pela jurisdicao. E apenas um rotulo de interface:
 *   Uruguai e Chile o chamam de `rut` mas usam algoritmos diferentes, escolhidos por pais.
 */
export type TaxIdKind = 'cuit' | 'rut'

/**
 * @en Two VAT rates per jurisdiction, matching the `neto1`/`neto2` buckets persisted on `Factura`.
 * @es Dos alicuotas de IVA por jurisdiccion, alineadas con los buckets `neto1`/`neto2` de `Factura`.
 * @pt-BR Duas aliquotas de IVA por jurisdicao, alinhadas aos buckets `neto1`/`neto2` de `Factura`.
 */
export type VatRates = {
  standard: number
  reduced: number
}

/**
 * @en Algorithm pair a country provides for an identifier it validates.
 * @es Par de algoritmos que un pais aporta para un identificador que valida.
 * @pt-BR Par de algoritmos que um pais fornece para um identificador que valida.
 */
export type IdentifierAlgorithm = {
  validate: (value: string) => boolean
  format: (value: string) => string
}

/**
 * @en Tax identifier rules: the algorithm plus the label kind and a valid example for the UI.
 * @es Reglas del identificador fiscal: el algoritmo mas el tipo de etiqueta y un ejemplo valido.
 * @pt-BR Regras do identificador fiscal: o algoritmo mais o tipo de rotulo e um exemplo valido.
 */
export type TaxIdRules = IdentifierAlgorithm & {
  kind: TaxIdKind
  example: string
}

/**
 * @en Bank account identifier rules, or `null` where the country has no evidenced equivalent of the
 *   Argentine CBU in this repository.
 * @es Reglas del identificador bancario, o `null` donde el pais no tiene un equivalente del CBU
 *   argentino evidenciado en este repositorio.
 * @pt-BR Regras do identificador bancario, ou `null` onde o pais nao tem equivalente do CBU
 *   argentino evidenciado neste repositorio.
 */
export type BankAccountRules = IdentifierAlgorithm & {
  code: string
  digits: number
}

/**
 * @en Tax condition of the invoicing subject. `paysVat` is what the invoice engine actually needs:
 *   it replaces comparing against the Argentine `CF` and `Exento` codes.
 * @es Condicion fiscal del sujeto facturado. `paysVat` es lo que el motor de facturacion realmente
 *   necesita: reemplaza comparar contra los codigos argentinos `CF` y `Exento`.
 * @pt-BR Condicao fiscal do sujeito faturado. `paysVat` e o que o motor de faturamento realmente
 *   precisa: substitui a comparacao com os codigos argentinos `CF` e `Exento`.
 */
export type SubjectTaxCondition = {
  code: string
  labelKey: string
  paysVat: boolean
}

/**
 * @en Persisted VAT code of an article (`1`, `2`, `3`) mapped to the rate it means in this country.
 *   The label is derived from the rate, never written by hand in JSX or locale files.
 * @es Codigo de IVA persistido del articulo (`1`, `2`, `3`) mapeado a la tasa que significa en este
 *   pais. La etiqueta se deriva de la tasa, nunca se escribe a mano en JSX ni en locales.
 * @pt-BR Codigo de IVA persistido do artigo (`1`, `2`, `3`) mapeado para a taxa que significa neste
 *   pais. O rotulo deriva da taxa, nunca e escrito a mao em JSX ou nos locales.
 */
export type VatRateCode = {
  code: string
  rate: number
  exempt: boolean
}

/**
 * @en Everything a country declares about its own tax legislation.
 * @es Todo lo que un pais declara sobre su propia legislacion fiscal.
 * @pt-BR Tudo o que um pais declara sobre sua propria legislacao fiscal.
 */
export type FiscalRuleSet = {
  code: string
  label: string
  currency: string
  taxId: TaxIdRules
  bankAccount: BankAccountRules | null
  /**
   * @en Tax conditions offered for customers, suppliers and the issuing company, with the first one
   *   used as the default for new records.
   * @es Condiciones fiscales ofrecidas para clientes, proveedores y empresa emisora; la primera se
   *   usa como default de los registros nuevos.
   * @pt-BR Condicoes fiscais oferecidas para clientes, fornecedores e empresa emissora; a primeira e
   *   usada como padrao dos registros novos.
   */
  subjectTaxConditions: readonly SubjectTaxCondition[]
  vatRateCodes: readonly VatRateCode[]
  /**
   * @en Invoice letters the country uses, or `null` where the concept does not exist.
   * @es Letras de comprobante que usa el pais, o `null` donde el concepto no existe.
   * @pt-BR Letras de comprovante usadas pelo pais, ou `null` onde o conceito nao existe.
   */
  documentKinds: readonly string[] | null
  vatRates: VatRates
  /**
   * @en Fiscal provider code expected for the jurisdiction; must exist in the provider registry.
   * @es Codigo de proveedor fiscal esperado para la jurisdiccion; debe existir en el registro.
   * @pt-BR Codigo de provedor fiscal esperado para a jurisdicao; deve existir no registro.
   */
  providerCode: string
}
