# ReciboCobroForma Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboCobroForma.schema.json](../schema-json/ReciboCobroForma.schema.json "open original schema") |

## ReciboCobroForma Type

`object` ([ReciboCobroForma](recibocobroforma.md))

# ReciboCobroForma Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                           |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [banco](#banco)               | `string`  | Optional | cannot be null | [ReciboCobroForma](recibocobroforma-properties-banco.md "undefined#/properties/banco")               |
| [chequeBanco](#chequebanco)   | `string`  | Optional | cannot be null | [ReciboCobroForma](recibocobroforma-properties-chequebanco.md "undefined#/properties/chequeBanco")   |
| [chequeId](#chequeid)         | `integer` | Optional | cannot be null | [ReciboCobroForma](recibocobroforma-properties-chequeid.md "undefined#/properties/chequeId")         |
| [chequeNumero](#chequenumero) | `string`  | Optional | cannot be null | [ReciboCobroForma](recibocobroforma-properties-chequenumero.md "undefined#/properties/chequeNumero") |
| [id](#id)                     | `integer` | Required | cannot be null | [ReciboCobroForma](recibocobroforma-properties-id.md "undefined#/properties/id")                     |
| [importe](#importe)           | `string`  | Required | cannot be null | [ReciboCobroForma](recibocobroforma-properties-importe.md "undefined#/properties/importe")           |
| [referencia](#referencia)     | `string`  | Optional | cannot be null | [ReciboCobroForma](recibocobroforma-properties-referencia.md "undefined#/properties/referencia")     |
| [tipo](#tipo)                 | `string`  | Required | cannot be null | [ReciboCobroForma](recibocobroforma-properties-tipo.md "undefined#/properties/tipo")                 |

## banco



`banco`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-banco.md "undefined#/properties/banco")

### banco Type

`string`

## chequeBanco



`chequeBanco`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-chequebanco.md "undefined#/properties/chequeBanco")

### chequeBanco Type

`string`

## chequeId



`chequeId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-chequeid.md "undefined#/properties/chequeId")

### chequeId Type

`integer`

## chequeNumero



`chequeNumero`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-chequenumero.md "undefined#/properties/chequeNumero")

### chequeNumero Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## importe



`importe`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-importe.md "undefined#/properties/importe")

### importe Type

`string`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobroForma](recibocobroforma-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"efectivo"`      |             |
| `"transferencia"` |             |
| `"cheque"`        |             |
| `"mercadopago"`   |             |
| `"tarjeta"`       |             |
| `"otro"`          |             |
