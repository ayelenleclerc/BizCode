# ContratoItem Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoItem.schema.json](../schema-json/ContratoItem.schema.json "open original schema") |

## ContratoItem Type

`object` ([ContratoItem](contratoitem.md))

# ContratoItem Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                       |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Optional | cannot be null | [ContratoItem](contratoitem-properties-articuloid.md "undefined#/properties/articuloId")         |
| [cantidad](#cantidad)             | `integer` | Optional | cannot be null | [ContratoItem](contratoitem-properties-cantidad.md "undefined#/properties/cantidad")             |
| [condIva](#condiva)               | `string`  | Optional | cannot be null | [ContratoItem](contratoitem-properties-condiva.md "undefined#/properties/condIva")               |
| [descripcion](#descripcion)       | `string`  | Optional | cannot be null | [ContratoItem](contratoitem-properties-descripcion.md "undefined#/properties/descripcion")       |
| [dscto](#dscto)                   | `number`  | Optional | cannot be null | [ContratoItem](contratoitem-properties-dscto.md "undefined#/properties/dscto")                   |
| [id](#id)                         | `integer` | Optional | cannot be null | [ContratoItem](contratoitem-properties-id.md "undefined#/properties/id")                         |
| [precioUnit](#preciounit)         | `number`  | Optional | cannot be null | [ContratoItem](contratoitem-properties-preciounit.md "undefined#/properties/precioUnit")         |
| [unidadServicio](#unidadservicio) | `string`  | Optional | cannot be null | [ContratoItem](contratoitem-properties-unidadservicio.md "undefined#/properties/unidadServicio") |
| Additional Properties             | Any       | Optional | can be null    |                                                                                                  |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

### cantidad Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-condiva.md "undefined#/properties/condIva")

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

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## dscto



`dscto`

* is optional

* Type: `number`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-dscto.md "undefined#/properties/dscto")

### dscto Type

`number`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## precioUnit



`precioUnit`

* is optional

* Type: `number`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-preciounit.md "undefined#/properties/precioUnit")

### precioUnit Type

`number`

## unidadServicio



`unidadServicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoItem](contratoitem-properties-unidadservicio.md "undefined#/properties/unidadServicio")

### unidadServicio Type

`string`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
