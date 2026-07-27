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

| Property                              | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [articulo](#articulo)                 | `object`  | Optional | cannot be null | [FacturaItem](articulo.md "undefined#/properties/articulo")                                        |
| [articuloId](#articuloid)             | `integer` | Optional | cannot be null | [FacturaItem](facturaitem-properties-articuloid.md "undefined#/properties/articuloId")             |
| [cantidad](#cantidad)                 | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-cantidad.md "undefined#/properties/cantidad")                 |
| [codigoAfipUnidad](#codigoafipunidad) | `string`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-codigoafipunidad.md "undefined#/properties/codigoAfipUnidad") |
| [condIva](#condiva)                   | `string`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-condiva.md "undefined#/properties/condIva")                   |
| [descripcion](#descripcion)           | `string`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-descripcion.md "undefined#/properties/descripcion")           |
| [dscto](#dscto)                       | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-dscto.md "undefined#/properties/dscto")                       |
| [id](#id)                             | `integer` | Optional | cannot be null | [FacturaItem](facturaitem-properties-id.md "undefined#/properties/id")                             |
| [precio](#precio)                     | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-precio.md "undefined#/properties/precio")                     |
| [subtotal](#subtotal)                 | `number`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-subtotal.md "undefined#/properties/subtotal")                 |
| [unidadMedida](#unidadmedida)         | `string`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-unidadmedida.md "undefined#/properties/unidadMedida")         |
| [unidadServicio](#unidadservicio)     | `string`  | Optional | cannot be null | [FacturaItem](facturaitem-properties-unidadservicio.md "undefined#/properties/unidadServicio")     |
| Additional Properties                 | Any       | Optional | can be null    |                                                                                                    |

## articulo



`articulo`

* is optional

* Type: `object` ([Articulo](articulo.md))

* cannot be null

* defined in: [FacturaItem](articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Articulo](articulo.md))

## articuloId

Null for ad-hoc service lines (#244).

`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad

Quantity in article base units; may be decimal for cut-to-size UoM (#203).

`cantidad`

* is optional

* Type: `number`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## codigoAfipUnidad

AFIP WSFE UniMedida code snapshot (#203). Mock CAE has no line XML yet.

`codigoAfipUnidad`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-codigoafipunidad.md "undefined#/properties/codigoAfipUnidad")

### codigoAfipUnidad Type

`string`

### codigoAfipUnidad Constraints

**maximum length**: the maximum number of characters for this string is: `2`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

### condIva Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"1"` |             |
| `"2"` |             |
| `"3"` |             |

## descripcion

Line snapshot (catalog or free-text) (#244).

`descripcion`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `120`

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

## unidadMedida

Base UoM snapshot at invoice time (#203).

`unidadMedida`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-unidadmedida.md "undefined#/properties/unidadMedida")

### unidadMedida Type

`string`

## unidadServicio



`unidadServicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaItem](facturaitem-properties-unidadservicio.md "undefined#/properties/unidadServicio")

### unidadServicio Type

`string`

### unidadServicio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"hora"`     |             |
| `"dia"`      |             |
| `"mes"`      |             |
| `"proyecto"` |             |
| `"km"`       |             |
| `"unidad"`   |             |
| `"otro"`     |             |

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
