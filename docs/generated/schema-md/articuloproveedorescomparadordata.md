# ArticuloProveedoresComparadorData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloProveedoresComparadorEnvelope.schema.json\*](../schema-json/ArticuloProveedoresComparadorEnvelope.schema.json "open original schema") |

## data Type

`object` ([ArticuloProveedoresComparadorData](articuloproveedorescomparadordata.md))

# data Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                                             |
| :-------------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloCodigo](#articulocodigo)             | `integer` | Required | cannot be null | [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-articulocodigo.md "undefined#/properties/articuloCodigo")             |
| [articuloDescripcion](#articulodescripcion)   | `string`  | Required | cannot be null | [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-articulodescripcion.md "undefined#/properties/articuloDescripcion")   |
| [articuloId](#articuloid)                     | `integer` | Required | cannot be null | [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-articuloid.md "undefined#/properties/articuloId")                     |
| [proveedorMasBaratoId](#proveedormasbaratoid) | `integer` | Required | cannot be null | [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-proveedormasbaratoid.md "undefined#/properties/proveedorMasBaratoId") |
| [proveedores](#proveedores)                   | `array`   | Required | cannot be null | [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-proveedores.md "undefined#/properties/proveedores")                   |

## articuloCodigo



`articuloCodigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-articulocodigo.md "undefined#/properties/articuloCodigo")

### articuloCodigo Type

`integer`

## articuloDescripcion



`articuloDescripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-articulodescripcion.md "undefined#/properties/articuloDescripcion")

### articuloDescripcion Type

`string`

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## proveedorMasBaratoId



`proveedorMasBaratoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-proveedormasbaratoid.md "undefined#/properties/proveedorMasBaratoId")

### proveedorMasBaratoId Type

`integer`

## proveedores



`proveedores`

* is required

* Type: `object[]` ([ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow.md))

* cannot be null

* defined in: [ArticuloProveedoresComparadorData](articuloproveedorescomparadordata-properties-proveedores.md "undefined#/properties/proveedores")

### proveedores Type

`object[]` ([ArticuloProveedorComparadorRow](articuloproveedorcomparadorrow.md))
