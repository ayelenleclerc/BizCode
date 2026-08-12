# PlantillaPedidoItemInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [PlantillaPedidoPatchBody.schema.json\*](../schema-json/PlantillaPedidoPatchBody.schema.json "open original schema") |

## items Type

`object` ([PlantillaPedidoItemInput](plantillapedidoiteminput.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)         | `boolean` | Optional | cannot be null | [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-activo.md "undefined#/properties/activo")         |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-articuloid.md "undefined#/properties/articuloId") |
| [cantidad](#cantidad)     | `number`  | Required | cannot be null | [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-cantidad.md "undefined#/properties/cantidad")     |
| [orden](#orden)           | `integer` | Optional | cannot be null | [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-orden.md "undefined#/properties/orden")           |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

### cantidad Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## orden



`orden`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedidoItemInput](plantillapedidoiteminput-properties-orden.md "undefined#/properties/orden")

### orden Type

`integer`

### orden Constraints

**minimum**: the value of this number must greater than or equal to: `0`
