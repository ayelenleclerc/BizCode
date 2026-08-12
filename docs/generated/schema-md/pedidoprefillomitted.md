# PedidoPrefillOmitted Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoPrefillOmitted.schema.json](../schema-json/PedidoPrefillOmitted.schema.json "open original schema") |

## PedidoPrefillOmitted Type

`object` ([PedidoPrefillOmitted](pedidoprefillomitted.md))

# PedidoPrefillOmitted Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                 |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)   | `integer` | Required | cannot be null | [PedidoPrefillOmitted](pedidoprefillomitted-properties-articuloid.md "undefined#/properties/articuloId")   |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [PedidoPrefillOmitted](pedidoprefillomitted-properties-descripcion.md "undefined#/properties/descripcion") |
| [reason](#reason)           | `string`  | Required | cannot be null | [PedidoPrefillOmitted](repeatomitreason.md "undefined#/properties/reason")                                 |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoPrefillOmitted](pedidoprefillomitted-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoPrefillOmitted](pedidoprefillomitted-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## reason



`reason`

* is required

* Type: `string` ([RepeatOmitReason](repeatomitreason.md))

* cannot be null

* defined in: [PedidoPrefillOmitted](repeatomitreason.md "undefined#/properties/reason")

### reason Type

`string` ([RepeatOmitReason](repeatomitreason.md))

### reason Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"inactive"` |             |
| `"parent"`   |             |
| `"missing"`  |             |
| `"service"`  |             |
