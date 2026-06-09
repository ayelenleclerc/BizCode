# RepartoActivo Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoActivoListEnvelope.schema.json\*](../schema-json/RepartoActivoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([RepartoActivo](repartoactivo.md))

# items Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                           |
| :---------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [chofer](#chofer)                   | `object`  | Required | cannot be null | [RepartoActivo](repartoactivo-properties-chofer.md "undefined#/properties/chofer")                   |
| [choferId](#choferid)               | `integer` | Required | cannot be null | [RepartoActivo](repartoactivo-properties-choferid.md "undefined#/properties/choferId")               |
| [currentStop](#currentstop)         | Merged    | Required | cannot be null | [RepartoActivo](repartoactivo-properties-currentstop.md "undefined#/properties/currentStop")         |
| [estado](#estado)                   | `string`  | Required | cannot be null | [RepartoActivo](repartoactivo-properties-estado.md "undefined#/properties/estado")                   |
| [fecha](#fecha)                     | `string`  | Required | cannot be null | [RepartoActivo](repartoactivo-properties-fecha.md "undefined#/properties/fecha")                     |
| [id](#id)                           | `integer` | Required | cannot be null | [RepartoActivo](repartoactivo-properties-id.md "undefined#/properties/id")                           |
| [observaciones](#observaciones)     | `string`  | Optional | cannot be null | [RepartoActivo](repartoactivo-properties-observaciones.md "undefined#/properties/observaciones")     |
| [progress](#progress)               | `object`  | Required | cannot be null | [RepartoActivo](repartoprogress.md "undefined#/properties/progress")                                 |
| [tenantId](#tenantid)               | `integer` | Required | cannot be null | [RepartoActivo](repartoactivo-properties-tenantid.md "undefined#/properties/tenantId")               |
| [ultimaUbicacion](#ultimaubicacion) | Merged    | Required | cannot be null | [RepartoActivo](repartoactivo-properties-ultimaubicacion.md "undefined#/properties/ultimaUbicacion") |
| [vehiculo](#vehiculo)               | `string`  | Optional | cannot be null | [RepartoActivo](repartoactivo-properties-vehiculo.md "undefined#/properties/vehiculo")               |

## chofer



`chofer`

* is required

* Type: `object` ([Details](repartoactivo-properties-chofer.md))

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-chofer.md "undefined#/properties/chofer")

### chofer Type

`object` ([Details](repartoactivo-properties-chofer.md))

## choferId



`choferId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-choferid.md "undefined#/properties/choferId")

### choferId Type

`integer`

## currentStop



`currentStop`

* is required

* Type: merged type ([Details](repartoactivo-properties-currentstop.md))

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-currentstop.md "undefined#/properties/currentStop")

### currentStop Type

merged type ([Details](repartoactivo-properties-currentstop.md))

one (and only one) of

* [RepartoActivoCurrentStop](repartoactivocurrentstop.md "check type definition")

* [Untitled null in RepartoActivo](repartoactivo-properties-currentstop-oneof-1.md "check type definition")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## progress



`progress`

* is required

* Type: `object` ([RepartoProgress](repartoprogress.md))

* cannot be null

* defined in: [RepartoActivo](repartoprogress.md "undefined#/properties/progress")

### progress Type

`object` ([RepartoProgress](repartoprogress.md))

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## ultimaUbicacion



`ultimaUbicacion`

* is required

* Type: merged type ([Details](repartoactivo-properties-ultimaubicacion.md))

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-ultimaubicacion.md "undefined#/properties/ultimaUbicacion")

### ultimaUbicacion Type

merged type ([Details](repartoactivo-properties-ultimaubicacion.md))

one (and only one) of

* [RepartoUbicacion](repartoubicacion.md "check type definition")

* [Untitled null in RepartoActivo](repartoactivo-properties-ultimaubicacion-oneof-1.md "check type definition")

## vehiculo



`vehiculo`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoActivo](repartoactivo-properties-vehiculo.md "undefined#/properties/vehiculo")

### vehiculo Type

`string`
