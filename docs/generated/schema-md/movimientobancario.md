# MovimientoBancario Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoBancario.schema.json](../schema-json/MovimientoBancario.schema.json "open original schema") |

## MovimientoBancario Type

`object` ([MovimientoBancario](movimientobancario.md))

# MovimientoBancario Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [conciliadoAt](#conciliadoat)   | `string`  | Optional | cannot be null | [MovimientoBancario](movimientobancario-properties-conciliadoat.md "undefined#/properties/conciliadoAt")   |
| [conciliadoId](#conciliadoid)   | `integer` | Optional | cannot be null | [MovimientoBancario](movimientobancario-properties-conciliadoid.md "undefined#/properties/conciliadoId")   |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-createdat.md "undefined#/properties/createdAt")         |
| [cuentaId](#cuentaid)           | `integer` | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-cuentaid.md "undefined#/properties/cuentaId")           |
| [dedupeKey](#dedupekey)         | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-dedupekey.md "undefined#/properties/dedupeKey")         |
| [descripcion](#descripcion)     | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-descripcion.md "undefined#/properties/descripcion")     |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-fecha.md "undefined#/properties/fecha")                 |
| [formatoOrigen](#formatoorigen) | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-formatoorigen.md "undefined#/properties/formatoOrigen") |
| [id](#id)                       | `integer` | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-id.md "undefined#/properties/id")                       |
| [importe](#importe)             | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-importe.md "undefined#/properties/importe")             |
| [referencia](#referencia)       | `string`  | Optional | cannot be null | [MovimientoBancario](movimientobancario-properties-referencia.md "undefined#/properties/referencia")       |
| [saldo](#saldo)                 | `string`  | Optional | cannot be null | [MovimientoBancario](movimientobancario-properties-saldo.md "undefined#/properties/saldo")                 |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [MovimientoBancario](movimientobancario-properties-tipo.md "undefined#/properties/tipo")                   |

## conciliadoAt



`conciliadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-conciliadoat.md "undefined#/properties/conciliadoAt")

### conciliadoAt Type

`string`

### conciliadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## conciliadoId



`conciliadoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-conciliadoid.md "undefined#/properties/conciliadoId")

### conciliadoId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## cuentaId



`cuentaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-cuentaid.md "undefined#/properties/cuentaId")

### cuentaId Type

`integer`

## dedupeKey



`dedupeKey`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-dedupekey.md "undefined#/properties/dedupeKey")

### dedupeKey Type

`string`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formatoOrigen



`formatoOrigen`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-formatoorigen.md "undefined#/properties/formatoOrigen")

### formatoOrigen Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## importe



`importe`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-importe.md "undefined#/properties/importe")

### importe Type

`string`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## saldo



`saldo`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoBancario](movimientobancario-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"debito"`  |             |
| `"credito"` |             |
