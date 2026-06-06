# ProveedorArticuloHistorialRow Schema

```txt
undefined#/properties/articulos/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorArticulosHistorialData.schema.json\*](../schema-json/ProveedorArticulosHistorialData.schema.json "open original schema") |

## items Type

`object` ([ProveedorArticuloHistorialRow](proveedorarticulohistorialrow.md))

# items Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                                           |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)                           | `integer` | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-articuloid.md "undefined#/properties/articuloId")                           |
| [cantidadTotal](#cantidadtotal)                     | `integer` | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-cantidadtotal.md "undefined#/properties/cantidadTotal")                     |
| [codigo](#codigo)                                   | `string`  | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-codigo.md "undefined#/properties/codigo")                                   |
| [descripcion](#descripcion)                         | `string`  | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-descripcion.md "undefined#/properties/descripcion")                         |
| [evolucionPrecios](#evolucionprecios)               | `array`   | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-evolucionprecios.md "undefined#/properties/evolucionPrecios")               |
| [montoTotal](#montototal)                           | `string`  | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-montototal.md "undefined#/properties/montoTotal")                           |
| [precioPromedioPonderado](#preciopromedioponderado) | `string`  | Required | cannot be null | [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-preciopromedioponderado.md "undefined#/properties/precioPromedioPonderado") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidadTotal



`cantidadTotal`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-cantidadtotal.md "undefined#/properties/cantidadTotal")

### cantidadTotal Type

`integer`

## codigo



`codigo`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## evolucionPrecios



`evolucionPrecios`

* is required

* Type: `object[]` ([ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto.md))

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-evolucionprecios.md "undefined#/properties/evolucionPrecios")

### evolucionPrecios Type

`object[]` ([ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto.md))

## montoTotal



`montoTotal`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-montototal.md "undefined#/properties/montoTotal")

### montoTotal Type

`string`

## precioPromedioPonderado



`precioPromedioPonderado`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorArticuloHistorialRow](proveedorarticulohistorialrow-properties-preciopromedioponderado.md "undefined#/properties/precioPromedioPonderado")

### precioPromedioPonderado Type

`string`
