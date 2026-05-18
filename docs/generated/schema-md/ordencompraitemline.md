# OrdenCompraItemLine Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenCompraItemLine.schema.json](../schema-json/OrdenCompraItemLine.schema.json "open original schema") |

## OrdenCompraItemLine Type

`object` ([OrdenCompraItemLine](ordencompraitemline.md))

# OrdenCompraItemLine Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [articulo](#articulo)                 | `object`  | Optional | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-articulo.md "undefined#/properties/articulo")                 |
| [articuloId](#articuloid)             | `integer` | Required | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-articuloid.md "undefined#/properties/articuloId")             |
| [cantidad](#cantidad)                 | `integer` | Required | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-cantidad.md "undefined#/properties/cantidad")                 |
| [cantidadRecibida](#cantidadrecibida) | `integer` | Required | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-cantidadrecibida.md "undefined#/properties/cantidadRecibida") |
| [costoUnitario](#costounitario)       | `string`  | Required | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-costounitario.md "undefined#/properties/costoUnitario")       |
| [id](#id)                             | `integer` | Required | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-id.md "undefined#/properties/id")                             |
| [subtotal](#subtotal)                 | `string`  | Required | cannot be null | [OrdenCompraItemLine](ordencompraitemline-properties-subtotal.md "undefined#/properties/subtotal")                 |

## articulo



`articulo`

* is optional

* Type: `object` ([Details](ordencompraitemline-properties-articulo.md))

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Details](ordencompraitemline-properties-articulo.md))

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

## cantidadRecibida



`cantidadRecibida`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-cantidadrecibida.md "undefined#/properties/cantidadRecibida")

### cantidadRecibida Type

`integer`

## costoUnitario



`costoUnitario`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-costounitario.md "undefined#/properties/costoUnitario")

### costoUnitario Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## subtotal



`subtotal`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenCompraItemLine](ordencompraitemline-properties-subtotal.md "undefined#/properties/subtotal")

### subtotal Type

`string`
