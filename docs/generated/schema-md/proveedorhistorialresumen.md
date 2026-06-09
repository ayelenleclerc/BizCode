# ProveedorHistorialResumen Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorHistorialResumen.schema.json](../schema-json/ProveedorHistorialResumen.schema.json "open original schema") |

## ProveedorHistorialResumen Type

`object` ([ProveedorHistorialResumen](proveedorhistorialresumen.md))

# ProveedorHistorialResumen Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                             |
| :-------------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [cantidadCompras](#cantidadcompras)           | `integer` | Required | cannot be null | [ProveedorHistorialResumen](proveedorhistorialresumen-properties-cantidadcompras.md "undefined#/properties/cantidadCompras")           |
| [compras](#compras)                           | `array`   | Required | cannot be null | [ProveedorHistorialResumen](proveedorhistorialresumen-properties-compras.md "undefined#/properties/compras")                           |
| [frecuenciaCompraDias](#frecuenciacompradias) | `integer` | Required | cannot be null | [ProveedorHistorialResumen](proveedorhistorialresumen-properties-frecuenciacompradias.md "undefined#/properties/frecuenciaCompraDias") |
| [periodoDias](#periododias)                   | `integer` | Required | cannot be null | [ProveedorHistorialResumen](proveedorhistorialresumen-properties-periododias.md "undefined#/properties/periodoDias")                   |
| [topArticulos](#toparticulos)                 | `array`   | Required | cannot be null | [ProveedorHistorialResumen](proveedorhistorialresumen-properties-toparticulos.md "undefined#/properties/topArticulos")                 |
| [totalComprado](#totalcomprado)               | `string`  | Required | cannot be null | [ProveedorHistorialResumen](proveedorhistorialresumen-properties-totalcomprado.md "undefined#/properties/totalComprado")               |

## cantidadCompras



`cantidadCompras`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorHistorialResumen](proveedorhistorialresumen-properties-cantidadcompras.md "undefined#/properties/cantidadCompras")

### cantidadCompras Type

`integer`

## compras



`compras`

* is required

* Type: `object[]` ([ProveedorCompraRow](proveedorcomprarow.md))

* cannot be null

* defined in: [ProveedorHistorialResumen](proveedorhistorialresumen-properties-compras.md "undefined#/properties/compras")

### compras Type

`object[]` ([ProveedorCompraRow](proveedorcomprarow.md))

## frecuenciaCompraDias



`frecuenciaCompraDias`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorHistorialResumen](proveedorhistorialresumen-properties-frecuenciacompradias.md "undefined#/properties/frecuenciaCompraDias")

### frecuenciaCompraDias Type

`integer`

## periodoDias



`periodoDias`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorHistorialResumen](proveedorhistorialresumen-properties-periododias.md "undefined#/properties/periodoDias")

### periodoDias Type

`integer`

### periodoDias Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `30`  |             |
| `90`  |             |
| `180` |             |
| `365` |             |

## topArticulos



`topArticulos`

* is required

* Type: `object[]` ([ProveedorHistorialTopArticulo](proveedorhistorialtoparticulo.md))

* cannot be null

* defined in: [ProveedorHistorialResumen](proveedorhistorialresumen-properties-toparticulos.md "undefined#/properties/topArticulos")

### topArticulos Type

`object[]` ([ProveedorHistorialTopArticulo](proveedorhistorialtoparticulo.md))

## totalComprado



`totalComprado`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorHistorialResumen](proveedorhistorialresumen-properties-totalcomprado.md "undefined#/properties/totalComprado")

### totalComprado Type

`string`
