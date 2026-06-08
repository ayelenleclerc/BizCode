# ProveedorCatalogoRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCatalogoRow.schema.json](../schema-json/ProveedorCatalogoRow.schema.json "open original schema") |

## ProveedorCatalogoRow Type

`object` ([ProveedorCatalogoRow](proveedorcatalogorow.md))

# ProveedorCatalogoRow Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)                     | `boolean` | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-activo.md "undefined#/properties/activo")                     |
| [articulo](#articulo)                 | `object`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogoarticuloref.md "undefined#/properties/articulo")                             |
| [articuloId](#articuloid)             | `integer` | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-articuloid.md "undefined#/properties/articuloId")             |
| [codigoProveedor](#codigoproveedor)   | `string`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-codigoproveedor.md "undefined#/properties/codigoProveedor")   |
| [descripcion](#descripcion)           | `string`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-descripcion.md "undefined#/properties/descripcion")           |
| [id](#id)                             | `integer` | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-id.md "undefined#/properties/id")                             |
| [multiplo](#multiplo)                 | `string`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-multiplo.md "undefined#/properties/multiplo")                 |
| [precioLista](#preciolista)           | `string`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-preciolista.md "undefined#/properties/precioLista")           |
| [precioListaFecha](#preciolistafecha) | `string`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-preciolistafecha.md "undefined#/properties/precioListaFecha") |
| [unidadCompra](#unidadcompra)         | `string`  | Required | cannot be null | [ProveedorCatalogoRow](proveedorcatalogorow-properties-unidadcompra.md "undefined#/properties/unidadCompra")         |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## articulo



`articulo`

* is required

* Type: `object` ([ProveedorCatalogoArticuloRef](proveedorcatalogoarticuloref.md))

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogoarticuloref.md "undefined#/properties/articulo")

### articulo Type

`object` ([ProveedorCatalogoArticuloRef](proveedorcatalogoarticuloref.md))

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## codigoProveedor



`codigoProveedor`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-codigoproveedor.md "undefined#/properties/codigoProveedor")

### codigoProveedor Type

`string`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## multiplo



`multiplo`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-multiplo.md "undefined#/properties/multiplo")

### multiplo Type

`string`

## precioLista



`precioLista`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-preciolista.md "undefined#/properties/precioLista")

### precioLista Type

`string`

## precioListaFecha



`precioListaFecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-preciolistafecha.md "undefined#/properties/precioListaFecha")

### precioListaFecha Type

`string`

### precioListaFecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## unidadCompra



`unidadCompra`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoRow](proveedorcatalogorow-properties-unidadcompra.md "undefined#/properties/unidadCompra")

### unidadCompra Type

`string`
