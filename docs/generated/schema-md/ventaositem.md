# VentaOSItem Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VentaOSItem.schema.json](../schema-json/VentaOSItem.schema.json "open original schema") |

## VentaOSItem Type

`object` ([VentaOSItem](ventaositem.md))

# VentaOSItem Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                     |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Required | cannot be null | [VentaOSItem](ventaositem-properties-articuloid.md "undefined#/properties/articuloId")         |
| [cantidad](#cantidad)             | `number`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-cantidad.md "undefined#/properties/cantidad")             |
| [coberturaPct](#coberturapct)     | `number`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-coberturapct.md "undefined#/properties/coberturaPct")     |
| [copago](#copago)                 | `number`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-copago.md "undefined#/properties/copago")                 |
| [creditoOS](#creditoos)           | `number`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-creditoos.md "undefined#/properties/creditoOS")           |
| [descripcion](#descripcion)       | `string`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-descripcion.md "undefined#/properties/descripcion")       |
| [id](#id)                         | `integer` | Required | cannot be null | [VentaOSItem](ventaositem-properties-id.md "undefined#/properties/id")                         |
| [precioUnitario](#preciounitario) | `number`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-preciounitario.md "undefined#/properties/precioUnitario") |
| [subtotal](#subtotal)             | `number`  | Required | cannot be null | [VentaOSItem](ventaositem-properties-subtotal.md "undefined#/properties/subtotal")             |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [VentaOSItem](ventaositem-properties-tenantid.md "undefined#/properties/tenantId")             |
| [tipoProducto](#tipoproducto)     | `string`  | Required | cannot be null | [VentaOSItem](ostipoproducto.md "undefined#/properties/tipoProducto")                          |
| [ventaConOSId](#ventaconosid)     | `integer` | Required | cannot be null | [VentaOSItem](ventaositem-properties-ventaconosid.md "undefined#/properties/ventaConOSId")     |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## coberturaPct



`coberturaPct`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-coberturapct.md "undefined#/properties/coberturaPct")

### coberturaPct Type

`number`

## copago



`copago`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-copago.md "undefined#/properties/copago")

### copago Type

`number`

## creditoOS



`creditoOS`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-creditoos.md "undefined#/properties/creditoOS")

### creditoOS Type

`number`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## precioUnitario



`precioUnitario`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-preciounitario.md "undefined#/properties/precioUnitario")

### precioUnitario Type

`number`

## subtotal



`subtotal`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-subtotal.md "undefined#/properties/subtotal")

### subtotal Type

`number`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipoProducto



`tipoProducto`

* is required

* Type: `string` ([OsTipoProducto](ostipoproducto.md))

* cannot be null

* defined in: [VentaOSItem](ostipoproducto.md "undefined#/properties/tipoProducto")

### tipoProducto Type

`string` ([OsTipoProducto](ostipoproducto.md))

### tipoProducto Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"generico"`   |             |
| `"marca"`      |             |
| `"cronico"`    |             |
| `"oncologico"` |             |

## ventaConOSId



`ventaConOSId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaOSItem](ventaositem-properties-ventaconosid.md "undefined#/properties/ventaConOSId")

### ventaConOSId Type

`integer`
