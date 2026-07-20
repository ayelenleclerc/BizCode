# TurnoCaja Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TurnoCajaListEnvelope.schema.json\*](../schema-json/TurnoCajaListEnvelope.schema.json "open original schema") |

## items Type

`object` ([TurnoCaja](turnocaja.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [cajaId](#cajaid)               | `integer` | Optional | cannot be null | [TurnoCaja](turnocaja-properties-cajaid.md "undefined#/properties/cajaId")               |
| [cajeroId](#cajeroid)           | `integer` | Optional | cannot be null | [TurnoCaja](turnocaja-properties-cajeroid.md "undefined#/properties/cajeroId")           |
| [diferencia](#diferencia)       | `number`  | Optional | cannot be null | [TurnoCaja](turnocaja-properties-diferencia.md "undefined#/properties/diferencia")       |
| [estado](#estado)               | `string`  | Optional | cannot be null | [TurnoCaja](turnocaja-properties-estado.md "undefined#/properties/estado")               |
| [id](#id)                       | `integer` | Optional | cannot be null | [TurnoCaja](turnocaja-properties-id.md "undefined#/properties/id")                       |
| [montoApertura](#montoapertura) | `number`  | Optional | cannot be null | [TurnoCaja](turnocaja-properties-montoapertura.md "undefined#/properties/montoApertura") |
| Additional Properties           | Any       | Optional | can be null    |                                                                                          |

## cajaId



`cajaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TurnoCaja](turnocaja-properties-cajaid.md "undefined#/properties/cajaId")

### cajaId Type

`integer`

## cajeroId



`cajeroId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TurnoCaja](turnocaja-properties-cajeroid.md "undefined#/properties/cajeroId")

### cajeroId Type

`integer`

## diferencia



`diferencia`

* is optional

* Type: `number`

* cannot be null

* defined in: [TurnoCaja](turnocaja-properties-diferencia.md "undefined#/properties/diferencia")

### diferencia Type

`number`

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [TurnoCaja](turnocaja-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"abierto"` |             |
| `"cerrado"` |             |

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TurnoCaja](turnocaja-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## montoApertura



`montoApertura`

* is optional

* Type: `number`

* cannot be null

* defined in: [TurnoCaja](turnocaja-properties-montoapertura.md "undefined#/properties/montoApertura")

### montoApertura Type

`number`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
