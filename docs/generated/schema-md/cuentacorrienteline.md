# CuentaCorrienteLine Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CuentaCorrienteLine.schema.json](../schema-json/CuentaCorrienteLine.schema.json "open original schema") |

## CuentaCorrienteLine Type

`object` ([CuentaCorrienteLine](cuentacorrienteline.md))

# CuentaCorrienteLine Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [cobroId](#cobroid)       | `integer` | Optional | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-cobroid.md "undefined#/properties/cobroId")       |
| [credito](#credito)       | `string`  | Required | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-credito.md "undefined#/properties/credito")       |
| [debito](#debito)         | `string`  | Required | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-debito.md "undefined#/properties/debito")         |
| [facturaId](#facturaid)   | `integer` | Optional | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-facturaid.md "undefined#/properties/facturaId")   |
| [fecha](#fecha)           | `string`  | Required | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-fecha.md "undefined#/properties/fecha")           |
| [referencia](#referencia) | `string`  | Required | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-referencia.md "undefined#/properties/referencia") |
| [saldo](#saldo)           | `string`  | Required | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-saldo.md "undefined#/properties/saldo")           |
| [tipo](#tipo)             | `string`  | Required | cannot be null | [CuentaCorrienteLine](cuentacorrienteline-properties-tipo.md "undefined#/properties/tipo")             |

## cobroId



`cobroId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-cobroid.md "undefined#/properties/cobroId")

### cobroId Type

`integer`

## credito



`credito`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-credito.md "undefined#/properties/credito")

### credito Type

`string`

## debito



`debito`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-debito.md "undefined#/properties/debito")

### debito Type

`string`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha

ISO-8601 timestamp (empty for saldo\_inicial)

`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## referencia



`referencia`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## saldo



`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorrienteLine](cuentacorrienteline-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"factura"`       |             |
| `"cobro"`         |             |
| `"saldo_inicial"` |             |
