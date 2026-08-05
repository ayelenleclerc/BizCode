# PedidoTransitionInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoTransitionInput.schema.json](../schema-json/PedidoTransitionInput.schema.json "open original schema") |

## PedidoTransitionInput Type

`object` ([PedidoTransitionInput](pedidotransitioninput.md))

# PedidoTransitionInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [fecha](#fecha)             | `string`  | Optional | cannot be null | [PedidoTransitionInput](pedidotransitioninput-properties-fecha.md "undefined#/properties/fecha")             |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [PedidoTransitionInput](pedidotransitioninput-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [numero](#numero)           | `integer` | Optional | cannot be null | [PedidoTransitionInput](pedidotransitioninput-properties-numero.md "undefined#/properties/numero")           |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [PedidoTransitionInput](pedidotransitioninput-properties-prefijo.md "undefined#/properties/prefijo")         |
| [tipo](#tipo)               | `string`  | Optional | cannot be null | [PedidoTransitionInput](pedidotransitioninput-properties-tipo.md "undefined#/properties/tipo")               |
| [to](#to)                   | `string`  | Required | cannot be null | [PedidoTransitionInput](pedidotransitioninput-properties-to.md "undefined#/properties/to")                   |

## fecha

Required when to=invoiced

`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoTransitionInput](pedidotransitioninput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PedidoTransitionInput](pedidotransitioninput-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PedidoTransitionInput](pedidotransitioninput-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

### numero Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoTransitionInput](pedidotransitioninput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoTransitionInput](pedidotransitioninput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |

## to



`to`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoTransitionInput](pedidotransitioninput-properties-to.md "undefined#/properties/to")

### to Type

`string`

### to Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"confirmed"` |             |
| `"packed"`    |             |
| `"shipped"`   |             |
| `"delivered"` |             |
| `"invoiced"`  |             |
| `"collected"` |             |
| `"cancelled"` |             |
