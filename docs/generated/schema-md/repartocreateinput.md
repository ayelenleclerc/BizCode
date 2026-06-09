# RepartoCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoCreateInput.schema.json](../schema-json/RepartoCreateInput.schema.json "open original schema") |

## RepartoCreateInput Type

`object` ([RepartoCreateInput](repartocreateinput.md))

# RepartoCreateInput Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [choferId](#choferid)               | `integer` | Required | cannot be null | [RepartoCreateInput](repartocreateinput-properties-choferid.md "undefined#/properties/choferId")               |
| [fecha](#fecha)                     | `string`  | Required | cannot be null | [RepartoCreateInput](repartocreateinput-properties-fecha.md "undefined#/properties/fecha")                     |
| [observaciones](#observaciones)     | `string`  | Optional | cannot be null | [RepartoCreateInput](repartocreateinput-properties-observaciones.md "undefined#/properties/observaciones")     |
| [ordenEntregaIds](#ordenentregaids) | `array`   | Required | cannot be null | [RepartoCreateInput](repartocreateinput-properties-ordenentregaids.md "undefined#/properties/ordenEntregaIds") |
| [vehiculo](#vehiculo)               | `string`  | Optional | cannot be null | [RepartoCreateInput](repartocreateinput-properties-vehiculo.md "undefined#/properties/vehiculo")               |

## choferId



`choferId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoCreateInput](repartocreateinput-properties-choferid.md "undefined#/properties/choferId")

### choferId Type

`integer`

### choferId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [RepartoCreateInput](repartocreateinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoCreateInput](repartocreateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## ordenEntregaIds



`ordenEntregaIds`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [RepartoCreateInput](repartocreateinput-properties-ordenentregaids.md "undefined#/properties/ordenEntregaIds")

### ordenEntregaIds Type

`integer[]`

### ordenEntregaIds Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## vehiculo



`vehiculo`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoCreateInput](repartocreateinput-properties-vehiculo.md "undefined#/properties/vehiculo")

### vehiculo Type

`string`

### vehiculo Constraints

**maximum length**: the maximum number of characters for this string is: `60`
