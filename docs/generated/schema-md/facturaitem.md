# FacturaItem Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaItem.schema.json](../schema-json/FacturaItem.schema.json "open original schema") |

## FacturaItem Type

`object` ([FacturaItem](facturaitem.md))

# FacturaItem Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [articulo](#articulo)     | `object`  | Optional | cannot be null | [FacturaItem](articulo.md "undefined#/properties/articulo")                            |
| [articuloId](#articuloid) | `integer` | Optional | cannot be null | [FacturaItem](facturaitem-properties-articuloid.md "undefined#/properties/articuloId") |
| [cantidad](#cantidad)     | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-cantidad.md "undefined#/properties/cantidad")     |
| [dscto](#dscto)           | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-dscto.md "undefined#/properties/dscto")           |
| [id](#id)                 | `integer` | Optional | cannot be null | [FacturaItem](facturaitem-properties-id.md "undefined#/properties/id")                 |
| [precio](#precio)         | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-precio.md "undefined#/properties/precio")         |
| [subtotal](#subtotal)     | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-subtotal.md "undefined#/properties/subtotal")     |
| Additional Properties     | Any       | Optional | can be null    |                                                                                        |

## articulo



`articulo`

* is optional

* Type: `object` ([Articulo](articulo.md))

* cannot be null

* defined in: [FacturaItem](articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Articulo](articulo.md))

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is optional

* Type: `number`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## dscto



`dscto`

* is optional

* Type: `number`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-dscto.md "undefined#/properties/dscto")

### dscto Type

`number`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## precio



`precio`

* is optional

* Type: `number`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

## subtotal



`subtotal`

* is optional

* Type: `number`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-subtotal.md "undefined#/properties/subtotal")

### subtotal Type

`number`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
