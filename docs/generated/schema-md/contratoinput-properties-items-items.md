# Untitled object in ContratoInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoInput.schema.json\*](../schema-json/ContratoInput.schema.json "open original schema") |

## items Type

`object` ([Details](contratoinput-properties-items-items.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                                       |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Optional | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")         |
| [cantidad](#cantidad)             | `integer` | Required | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")             |
| [condIva](#condiva)               | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-condiva.md "undefined#/properties/items/items/properties/condIva")               |
| [descripcion](#descripcion)       | `string`  | Required | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-descripcion.md "undefined#/properties/items/items/properties/descripcion")       |
| [dscto](#dscto)                   | `number`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-dscto.md "undefined#/properties/items/items/properties/dscto")                   |
| [precioUnit](#preciounit)         | `number`  | Required | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-preciounit.md "undefined#/properties/items/items/properties/precioUnit")         |
| [unidadServicio](#unidadservicio) | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-items-items-properties-unidadservicio.md "undefined#/properties/items/items/properties/unidadServicio") |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")

### cantidad Type

`integer`

### cantidad Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-condiva.md "undefined#/properties/items/items/properties/condIva")

### condIva Type

`string`

### condIva Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"1"` |             |
| `"2"` |             |
| `"3"` |             |

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-descripcion.md "undefined#/properties/items/items/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`

## dscto



`dscto`

* is optional

* Type: `number`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-dscto.md "undefined#/properties/items/items/properties/dscto")

### dscto Type

`number`

### dscto Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## precioUnit



`precioUnit`

* is required

* Type: `number`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-preciounit.md "undefined#/properties/items/items/properties/precioUnit")

### precioUnit Type

`number`

### precioUnit Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## unidadServicio



`unidadServicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items-items-properties-unidadservicio.md "undefined#/properties/items/items/properties/unidadServicio")

### unidadServicio Type

`string`
