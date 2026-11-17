# Untitled object in VentaConOSCreateInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VentaConOSCreateInput.schema.json\*](../schema-json/VentaConOSCreateInput.schema.json "open original schema") |

## items Type

`object` ([Details](ventaconoscreateinput-properties-items-items.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                                                       |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Optional | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")         |
| [cantidad](#cantidad)             | `number`  | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")             |
| [descripcion](#descripcion)       | `string`  | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-descripcion.md "undefined#/properties/items/items/properties/descripcion")       |
| [precioUnitario](#preciounitario) | `number`  | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-preciounitario.md "undefined#/properties/items/items/properties/precioUnitario") |
| [tipoProducto](#tipoproducto)     | `string`  | Required | cannot be null | [VentaConOSCreateInput](ostipoproducto.md "undefined#/properties/items/items/properties/tipoProducto")                                                           |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")

### cantidad Type

`number`

### cantidad Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-descripcion.md "undefined#/properties/items/items/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `200`

**minimum length**: the minimum number of characters for this string is: `1`

## precioUnitario



`precioUnitario`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-items-items-properties-preciounitario.md "undefined#/properties/items/items/properties/precioUnitario")

### precioUnitario Type

`number`

### precioUnitario Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## tipoProducto



`tipoProducto`

* is required

* Type: `string` ([OsTipoProducto](ostipoproducto.md))

* cannot be null

* defined in: [VentaConOSCreateInput](ostipoproducto.md "undefined#/properties/items/items/properties/tipoProducto")

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
