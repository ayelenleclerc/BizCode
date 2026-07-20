# OrdenTrabajoItem Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoTransitionInput.schema.json\*](../schema-json/OrdenTrabajoTransitionInput.schema.json "open original schema") |

## items Type

`object` ([OrdenTrabajoItem](ordentrabajoitem.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)   | `integer` | Optional | cannot be null | [OrdenTrabajoItem](ordentrabajoitem-properties-articuloid.md "undefined#/properties/articuloId")   |
| [cantidad](#cantidad)       | `number`  | Required | cannot be null | [OrdenTrabajoItem](ordentrabajoitem-properties-cantidad.md "undefined#/properties/cantidad")       |
| [condIva](#condiva)         | `string`  | Optional | cannot be null | [OrdenTrabajoItem](ordentrabajoitem-properties-condiva.md "undefined#/properties/condIva")         |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [OrdenTrabajoItem](ordentrabajoitem-properties-descripcion.md "undefined#/properties/descripcion") |
| [precioUnit](#preciounit)   | `number`  | Required | cannot be null | [OrdenTrabajoItem](ordentrabajoitem-properties-preciounit.md "undefined#/properties/precioUnit")   |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [OrdenTrabajoItem](ordentrabajoitemtipo.md "undefined#/properties/tipo")                           |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajoItem](ordentrabajoitem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenTrabajoItem](ordentrabajoitem-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

### cantidad Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoItem](ordentrabajoitem-properties-condiva.md "undefined#/properties/condIva")

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

* defined in: [OrdenTrabajoItem](ordentrabajoitem-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`

## precioUnit



`precioUnit`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenTrabajoItem](ordentrabajoitem-properties-preciounit.md "undefined#/properties/precioUnit")

### precioUnit Type

`number`

### precioUnit Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## tipo



`tipo`

* is required

* Type: `string` ([OrdenTrabajoItemTipo](ordentrabajoitemtipo.md))

* cannot be null

* defined in: [OrdenTrabajoItem](ordentrabajoitemtipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([OrdenTrabajoItemTipo](ordentrabajoitemtipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"mano_de_obra"` |             |
| `"repuesto"`     |             |
| `"servicio"`     |             |
