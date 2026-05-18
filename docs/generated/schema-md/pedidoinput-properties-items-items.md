# Untitled object in PedidoInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoInput.schema.json\*](../schema-json/PedidoInput.schema.json "open original schema") |

## items Type

`object` ([Details](pedidoinput-properties-items-items.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                                           |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [PedidoInput](pedidoinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId") |
| [cantidad](#cantidad)     | `integer` | Required | cannot be null | [PedidoInput](pedidoinput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")     |
| [dscto](#dscto)           | `number`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-items-items-properties-dscto.md "undefined#/properties/items/items/properties/dscto")           |
| [precio](#precio)         | `number`  | Required | cannot be null | [PedidoInput](pedidoinput-properties-items-items-properties-precio.md "undefined#/properties/items/items/properties/precio")         |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")

### cantidad Type

`integer`

### cantidad Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## dscto



`dscto`

* is optional

* Type: `number`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-items-items-properties-dscto.md "undefined#/properties/items/items/properties/dscto")

### dscto Type

`number`

### dscto Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-items-items-properties-precio.md "undefined#/properties/items/items/properties/precio")

### precio Type

`number`

### precio Constraints

**minimum**: the value of this number must greater than or equal to: `0`
