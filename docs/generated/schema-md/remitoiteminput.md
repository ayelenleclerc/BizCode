# RemitoItemInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RemitoUpdateInput.schema.json\*](../schema-json/RemitoUpdateInput.schema.json "open original schema") |

## items Type

`object` ([RemitoItemInput](remitoiteminput.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                       |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)   | `integer` | Required | cannot be null | [RemitoItemInput](remitoiteminput-properties-articuloid.md "undefined#/properties/articuloId")   |
| [cantidad](#cantidad)       | `integer` | Required | cannot be null | [RemitoItemInput](remitoiteminput-properties-cantidad.md "undefined#/properties/cantidad")       |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [RemitoItemInput](remitoiteminput-properties-descripcion.md "undefined#/properties/descripcion") |
| [unidad](#unidad)           | `string`  | Required | cannot be null | [RemitoItemInput](remitoiteminput-properties-unidad.md "undefined#/properties/unidad")           |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RemitoItemInput](remitoiteminput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [RemitoItemInput](remitoiteminput-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

### cantidad Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [RemitoItemInput](remitoiteminput-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## unidad



`unidad`

* is required

* Type: `string`

* cannot be null

* defined in: [RemitoItemInput](remitoiteminput-properties-unidad.md "undefined#/properties/unidad")

### unidad Type

`string`
