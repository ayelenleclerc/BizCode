# ListaPrecioItemInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioItemInput.schema.json](../schema-json/ListaPrecioItemInput.schema.json "open original schema") |

## ListaPrecioItemInput Type

`object` ([ListaPrecioItemInput](listaprecioiteminput.md))

# ListaPrecioItemInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                 |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)   | `integer` | Required | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-articuloid.md "undefined#/properties/articuloId")   |
| [escalonados](#escalonados) | `array`   | Optional | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados.md "undefined#/properties/escalonados") |
| [porcentaje](#porcentaje)   | `number`  | Optional | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-porcentaje.md "undefined#/properties/porcentaje")   |
| [precio](#precio)           | `number`  | Optional | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-precio.md "undefined#/properties/precio")           |
| [tipoPrecio](#tipoprecio)   | `string`  | Required | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-tipoprecio.md "undefined#/properties/tipoPrecio")   |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## escalonados



`escalonados`

* is optional

* Type: `object[]` ([Details](listaprecioiteminput-properties-escalonados-items.md))

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados.md "undefined#/properties/escalonados")

### escalonados Type

`object[]` ([Details](listaprecioiteminput-properties-escalonados-items.md))

## porcentaje



`porcentaje`

* is optional

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-porcentaje.md "undefined#/properties/porcentaje")

### porcentaje Type

`number`

## precio



`precio`

* is optional

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

### precio Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## tipoPrecio



`tipoPrecio`

* is required

* Type: `string`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-tipoprecio.md "undefined#/properties/tipoPrecio")

### tipoPrecio Type

`string`

### tipoPrecio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                     | Explanation |
| :------------------------ | :---------- |
| `"fijo"`                  |             |
| `"porcentaje_sobre_base"` |             |
