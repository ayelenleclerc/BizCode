# Recuento Schema

```txt
undefined#/allOf/1/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecuentoListEnvelope.schema.json\*](../schema-json/RecuentoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Recuento](recuento.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                       |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------- |
| [closedAt](#closedat)     | `string`  | Optional | cannot be null | [Recuento](recuento-properties-closedat.md "undefined#/properties/closedAt")     |
| [estado](#estado)         | `string`  | Required | cannot be null | [Recuento](recuento-properties-estado.md "undefined#/properties/estado")         |
| [fecha](#fecha)           | `string`  | Required | cannot be null | [Recuento](recuento-properties-fecha.md "undefined#/properties/fecha")           |
| [id](#id)                 | `integer` | Required | cannot be null | [Recuento](recuento-properties-id.md "undefined#/properties/id")                 |
| [items](#items)           | `array`   | Required | cannot be null | [Recuento](recuento-properties-items.md "undefined#/properties/items")           |
| [operador](#operador)     | `object`  | Optional | cannot be null | [Recuento](recuento-properties-operador.md "undefined#/properties/operador")     |
| [operadorId](#operadorid) | `integer` | Required | cannot be null | [Recuento](recuento-properties-operadorid.md "undefined#/properties/operadorId") |

## closedAt



`closedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Recuento](recuento-properties-closedat.md "undefined#/properties/closedAt")

### closedAt Type

`string`

### closedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [Recuento](recuento-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"in_progress"` |             |
| `"closed"`      |             |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [Recuento](recuento-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Recuento](recuento-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is required

* Type: `object[]` ([RecuentoItemLine](recuentoitemline.md))

* cannot be null

* defined in: [Recuento](recuento-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([RecuentoItemLine](recuentoitemline.md))

## operador



`operador`

* is optional

* Type: `object` ([Details](recuento-properties-operador.md))

* cannot be null

* defined in: [Recuento](recuento-properties-operador.md "undefined#/properties/operador")

### operador Type

`object` ([Details](recuento-properties-operador.md))

## operadorId



`operadorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Recuento](recuento-properties-operadorid.md "undefined#/properties/operadorId")

### operadorId Type

`integer`
