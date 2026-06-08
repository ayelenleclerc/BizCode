# ArticuloProveedorComparadorRow Schema

```txt
undefined#/properties/proveedores/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloProveedoresComparadorData.schema.json\*](../schema-json/ArticuloProveedoresComparadorData.schema.json "open original schema") |

## items Type

`object` ([ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow.md))

# items Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                                       |
| :-------------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [codigoProveedor](#codigoproveedor)           | `string`  | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-codigoproveedor.md "undefined#/properties/codigoProveedor")           |
| [descripcionProveedor](#descripcionproveedor) | `string`  | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-descripcionproveedor.md "undefined#/properties/descripcionProveedor") |
| [esMasBarato](#esmasbarato)                   | `boolean` | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-esmasbarato.md "undefined#/properties/esMasBarato")                   |
| [precioDesactualizado](#preciodesactualizado) | `boolean` | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-preciodesactualizado.md "undefined#/properties/precioDesactualizado") |
| [precioLista](#preciolista)                   | `string`  | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-preciolista.md "undefined#/properties/precioLista")                   |
| [precioListaFecha](#preciolistafecha)         | `string`  | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-preciolistafecha.md "undefined#/properties/precioListaFecha")         |
| [proveedorCodigo](#proveedorcodigo)           | `integer` | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-proveedorcodigo.md "undefined#/properties/proveedorCodigo")           |
| [proveedorId](#proveedorid)                   | `integer` | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-proveedorid.md "undefined#/properties/proveedorId")                   |
| [proveedorRsocial](#proveedorrsocial)         | `string`  | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-proveedorrsocial.md "undefined#/properties/proveedorRsocial")         |
| [ultimaCompraFecha](#ultimacomprafecha)       | `string`  | Required | cannot be null | [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-ultimacomprafecha.md "undefined#/properties/ultimaCompraFecha")       |

## codigoProveedor



`codigoProveedor`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-codigoproveedor.md "undefined#/properties/codigoProveedor")

### codigoProveedor Type

`string`

## descripcionProveedor



`descripcionProveedor`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-descripcionproveedor.md "undefined#/properties/descripcionProveedor")

### descripcionProveedor Type

`string`

## esMasBarato



`esMasBarato`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-esmasbarato.md "undefined#/properties/esMasBarato")

### esMasBarato Type

`boolean`

## precioDesactualizado



`precioDesactualizado`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-preciodesactualizado.md "undefined#/properties/precioDesactualizado")

### precioDesactualizado Type

`boolean`

## precioLista



`precioLista`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-preciolista.md "undefined#/properties/precioLista")

### precioLista Type

`string`

## precioListaFecha



`precioListaFecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-preciolistafecha.md "undefined#/properties/precioListaFecha")

### precioListaFecha Type

`string`

### precioListaFecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## proveedorCodigo



`proveedorCodigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-proveedorcodigo.md "undefined#/properties/proveedorCodigo")

### proveedorCodigo Type

`integer`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## proveedorRsocial



`proveedorRsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-proveedorrsocial.md "undefined#/properties/proveedorRsocial")

### proveedorRsocial Type

`string`

## ultimaCompraFecha



`ultimaCompraFecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow-properties-ultimacomprafecha.md "undefined#/properties/ultimaCompraFecha")

### ultimaCompraFecha Type

`string`

### ultimaCompraFecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
