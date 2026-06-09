# Reparto Schema

```txt
undefined#/allOf/1/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoListEnvelope.schema.json\*](../schema-json/RepartoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Reparto](reparto.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [chofer](#chofer)               | `object`  | Optional | cannot be null | [Reparto](reparto-properties-chofer.md "undefined#/properties/chofer")               |
| [choferId](#choferid)           | `integer` | Required | cannot be null | [Reparto](reparto-properties-choferid.md "undefined#/properties/choferId")           |
| [closedAt](#closedat)           | `string`  | Optional | cannot be null | [Reparto](reparto-properties-closedat.md "undefined#/properties/closedAt")           |
| [estado](#estado)               | `string`  | Required | cannot be null | [Reparto](reparto-properties-estado.md "undefined#/properties/estado")               |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [Reparto](reparto-properties-fecha.md "undefined#/properties/fecha")                 |
| [id](#id)                       | `integer` | Required | cannot be null | [Reparto](reparto-properties-id.md "undefined#/properties/id")                       |
| [items](#items)                 | `array`   | Required | cannot be null | [Reparto](reparto-properties-items.md "undefined#/properties/items")                 |
| [observaciones](#observaciones) | `string`  | Optional | cannot be null | [Reparto](reparto-properties-observaciones.md "undefined#/properties/observaciones") |
| [progress](#progress)           | `object`  | Required | cannot be null | [Reparto](repartoprogress.md "undefined#/properties/progress")                       |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [Reparto](reparto-properties-tenantid.md "undefined#/properties/tenantId")           |
| [vehiculo](#vehiculo)           | `string`  | Optional | cannot be null | [Reparto](reparto-properties-vehiculo.md "undefined#/properties/vehiculo")           |

## chofer



`chofer`

* is optional

* Type: `object` ([Details](reparto-properties-chofer.md))

* cannot be null

* defined in: [Reparto](reparto-properties-chofer.md "undefined#/properties/chofer")

### chofer Type

`object` ([Details](reparto-properties-chofer.md))

## choferId



`choferId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Reparto](reparto-properties-choferid.md "undefined#/properties/choferId")

### choferId Type

`integer`

## closedAt



`closedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Reparto](reparto-properties-closedat.md "undefined#/properties/closedAt")

### closedAt Type

`string`

### closedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [Reparto](reparto-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"planned"`   |             |
| `"on_route"`  |             |
| `"completed"` |             |
| `"cancelled"` |             |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [Reparto](reparto-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Reparto](reparto-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is required

* Type: `object[]` ([RepartoItemLine](repartoitemline.md))

* cannot be null

* defined in: [Reparto](reparto-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([RepartoItemLine](repartoitemline.md))

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [Reparto](reparto-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## progress



`progress`

* is required

* Type: `object` ([RepartoProgress](repartoprogress.md))

* cannot be null

* defined in: [Reparto](repartoprogress.md "undefined#/properties/progress")

### progress Type

`object` ([RepartoProgress](repartoprogress.md))

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Reparto](reparto-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## vehiculo



`vehiculo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Reparto](reparto-properties-vehiculo.md "undefined#/properties/vehiculo")

### vehiculo Type

`string`
