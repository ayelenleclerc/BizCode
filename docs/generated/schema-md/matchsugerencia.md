# MatchSugerencia Schema

```txt
undefined#/properties/matchSugerencias/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoBancario.schema.json\*](../schema-json/MovimientoBancario.schema.json "open original schema") |

## items Type

`object` ([MatchSugerencia](matchsugerencia.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)   | `integer` | Required | cannot be null | [MatchSugerencia](matchsugerencia-properties-clienteid.md "undefined#/properties/clienteId")   |
| [fecha](#fecha)           | `string`  | Required | cannot be null | [MatchSugerencia](matchsugerencia-properties-fecha.md "undefined#/properties/fecha")           |
| [id](#id)                 | `integer` | Required | cannot be null | [MatchSugerencia](matchsugerencia-properties-id.md "undefined#/properties/id")                 |
| [importe](#importe)       | `number`  | Required | cannot be null | [MatchSugerencia](matchsugerencia-properties-importe.md "undefined#/properties/importe")       |
| [referencia](#referencia) | `string`  | Required | cannot be null | [MatchSugerencia](matchsugerencia-properties-referencia.md "undefined#/properties/referencia") |
| [tipo](#tipo)             | `string`  | Required | cannot be null | [MatchSugerencia](matchsugerencia-properties-tipo.md "undefined#/properties/tipo")             |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MatchSugerencia](matchsugerencia-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [MatchSugerencia](matchsugerencia-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MatchSugerencia](matchsugerencia-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## importe



`importe`

* is required

* Type: `number`

* cannot be null

* defined in: [MatchSugerencia](matchsugerencia-properties-importe.md "undefined#/properties/importe")

### importe Type

`number`

## referencia



`referencia`

* is required

* Type: `string`

* cannot be null

* defined in: [MatchSugerencia](matchsugerencia-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [MatchSugerencia](matchsugerencia-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"recibo_forma"` |             |
| `"cobro"`        |             |
