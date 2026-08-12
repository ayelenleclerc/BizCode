# PedidoPrefillLine Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoPrefillLine.schema.json](../schema-json/PedidoPrefillLine.schema.json "open original schema") |

## PedidoPrefillLine Type

`object` ([PedidoPrefillLine](pedidoprefillline.md))

# PedidoPrefillLine Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)   | `integer` | Required | cannot be null | [PedidoPrefillLine](pedidoprefillline-properties-articuloid.md "undefined#/properties/articuloId")   |
| [cantidad](#cantidad)       | `number`  | Required | cannot be null | [PedidoPrefillLine](pedidoprefillline-properties-cantidad.md "undefined#/properties/cantidad")       |
| [condIva](#condiva)         | `string`  | Required | cannot be null | [PedidoPrefillLine](pedidoprefillline-properties-condiva.md "undefined#/properties/condIva")         |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [PedidoPrefillLine](pedidoprefillline-properties-descripcion.md "undefined#/properties/descripcion") |
| [precio](#precio)           | `number`  | Required | cannot be null | [PedidoPrefillLine](pedidoprefillline-properties-precio.md "undefined#/properties/precio")           |
| [stock](#stock)             | `number`  | Required | cannot be null | [PedidoPrefillLine](pedidoprefillline-properties-stock.md "undefined#/properties/stock")             |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoPrefillLine](pedidoprefillline-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [PedidoPrefillLine](pedidoprefillline-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoPrefillLine](pedidoprefillline-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoPrefillLine](pedidoprefillline-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [PedidoPrefillLine](pedidoprefillline-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

## stock



`stock`

* is required

* Type: `number`

* cannot be null

* defined in: [PedidoPrefillLine](pedidoprefillline-properties-stock.md "undefined#/properties/stock")

### stock Type

`number`
