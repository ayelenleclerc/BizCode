# Untitled object in FacturaInput Schema

```txt
undefined#/properties/items/items
```

Catalog line requires articuloId. Ad-hoc service line omits articuloId and requires
descripcion + condIva (#244).

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaInput.schema.json\*](../schema-json/FacturaInput.schema.json "open original schema") |

## items Type

`object` ([Details](facturainput-properties-items-items.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                                     |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Optional | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")         |
| [cantidad](#cantidad)             | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")             |
| [condIva](#condiva)               | `string`  | Optional | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-condiva.md "undefined#/properties/items/items/properties/condIva")               |
| [descripcion](#descripcion)       | `string`  | Optional | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-descripcion.md "undefined#/properties/items/items/properties/descripcion")       |
| [dscto](#dscto)                   | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-dscto.md "undefined#/properties/items/items/properties/dscto")                   |
| [precio](#precio)                 | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-precio.md "undefined#/properties/items/items/properties/precio")                 |
| [subtotal](#subtotal)             | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-subtotal.md "undefined#/properties/items/items/properties/subtotal")             |
| [unidadServicio](#unidadservicio) | `string`  | Optional | cannot be null | [FacturaInput](facturainput-properties-items-items-properties-unidadservicio.md "undefined#/properties/items/items/properties/unidadServicio") |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-cantidad.md "undefined#/properties/items/items/properties/cantidad")

### cantidad Type

`number`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-condiva.md "undefined#/properties/items/items/properties/condIva")

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

* defined in: [FacturaInput](facturainput-properties-items-items-properties-descripcion.md "undefined#/properties/items/items/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`

## dscto



`dscto`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-dscto.md "undefined#/properties/items/items/properties/dscto")

### dscto Type

`number`

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-precio.md "undefined#/properties/items/items/properties/precio")

### precio Type

`number`

## subtotal



`subtotal`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-subtotal.md "undefined#/properties/items/items/properties/subtotal")

### subtotal Type

`number`

## unidadServicio



`unidadServicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items-items-properties-unidadservicio.md "undefined#/properties/items/items/properties/unidadServicio")

### unidadServicio Type

`string`

### unidadServicio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"hora"`     |             |
| `"dia"`      |             |
| `"mes"`      |             |
| `"proyecto"` |             |
| `"km"`       |             |
| `"unidad"`   |             |
| `"otro"`     |             |
