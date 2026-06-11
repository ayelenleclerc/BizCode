# Untitled object in ReciboCobroInput Schema

```txt
undefined#/properties/formas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboCobroInput.schema.json\*](../schema-json/ReciboCobroInput.schema.json "open original schema") |

## items Type

`object` ([Details](recibocobroinput-properties-formas-items.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                                                       |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [banco](#banco)           | `string`  | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-banco.md "undefined#/properties/formas/items/properties/banco")           |
| [chequeId](#chequeid)     | `integer` | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-chequeid.md "undefined#/properties/formas/items/properties/chequeId")     |
| [importe](#importe)       | `number`  | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-importe.md "undefined#/properties/formas/items/properties/importe")       |
| [referencia](#referencia) | `string`  | Optional | cannot be null | [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-referencia.md "undefined#/properties/formas/items/properties/referencia") |
| [tipo](#tipo)             | `string`  | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-tipo.md "undefined#/properties/formas/items/properties/tipo")             |

## banco



`banco`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-banco.md "undefined#/properties/formas/items/properties/banco")

### banco Type

`string`

## chequeId



`chequeId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-chequeid.md "undefined#/properties/formas/items/properties/chequeId")

### chequeId Type

`integer`

## importe



`importe`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-importe.md "undefined#/properties/formas/items/properties/importe")

### importe Type

`number`

### importe Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-referencia.md "undefined#/properties/formas/items/properties/referencia")

### referencia Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-formas-items-properties-tipo.md "undefined#/properties/formas/items/properties/tipo")

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
