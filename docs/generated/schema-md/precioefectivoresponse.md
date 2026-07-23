# PrecioEfectivoResponse Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrecioEfectivoResponse.schema.json](../schema-json/PrecioEfectivoResponse.schema.json "open original schema") |

## PrecioEfectivoResponse Type

`object` ([PrecioEfectivoResponse](precioefectivoresponse.md))

# PrecioEfectivoResponse Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)       | `integer` | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-articuloid.md "undefined#/properties/articuloId")       |
| [cantidad](#cantidad)           | `number`  | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-cantidad.md "undefined#/properties/cantidad")           |
| [listaPrecioId](#listaprecioid) | `integer` | Optional | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-listaprecioid.md "undefined#/properties/listaPrecioId") |
| [moneda](#moneda)               | `string`  | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-moneda.md "undefined#/properties/moneda")               |
| [origen](#origen)               | `string`  | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-origen.md "undefined#/properties/origen")               |
| [precio](#precio)               | `number`  | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-precio.md "undefined#/properties/precio")               |
| [precioBase](#preciobase)       | `number`  | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-preciobase.md "undefined#/properties/precioBase")       |
| [success](#success)             | `boolean` | Required | cannot be null | [PrecioEfectivoResponse](precioefectivoresponse-properties-success.md "undefined#/properties/success")             |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## listaPrecioId



`listaPrecioId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-listaprecioid.md "undefined#/properties/listaPrecioId")

### listaPrecioId Type

`integer`

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

## origen



`origen`

* is required

* Type: `string`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-origen.md "undefined#/properties/origen")

### origen Type

`string`

### origen Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                     | Explanation |
| :------------------------ | :---------- |
| `"escalonado"`            |             |
| `"fijo"`                  |             |
| `"porcentaje_sobre_base"` |             |
| `"base"`                  |             |

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

## precioBase



`precioBase`

* is required

* Type: `number`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-preciobase.md "undefined#/properties/precioBase")

### precioBase Type

`number`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PrecioEfectivoResponse](precioefectivoresponse-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
