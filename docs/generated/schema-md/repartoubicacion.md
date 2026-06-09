# RepartoUbicacion Schema

```txt
undefined#/properties/data/oneOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoUbicacionNullableEnvelope.schema.json\*](../schema-json/RepartoUbicacionNullableEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([RepartoUbicacion](repartoubicacion.md))

# 0 Properties

| Property                  | Type     | Required | Nullable       | Defined by                                                                                       |
| :------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [lat](#lat)               | `number` | Required | cannot be null | [RepartoUbicacion](repartoubicacion-properties-lat.md "undefined#/properties/lat")               |
| [lng](#lng)               | `number` | Required | cannot be null | [RepartoUbicacion](repartoubicacion-properties-lng.md "undefined#/properties/lng")               |
| [recordedAt](#recordedat) | `string` | Required | cannot be null | [RepartoUbicacion](repartoubicacion-properties-recordedat.md "undefined#/properties/recordedAt") |

## lat



`lat`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoUbicacion](repartoubicacion-properties-lat.md "undefined#/properties/lat")

### lat Type

`number`

## lng



`lng`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoUbicacion](repartoubicacion-properties-lng.md "undefined#/properties/lng")

### lng Type

`number`

## recordedAt



`recordedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RepartoUbicacion](repartoubicacion-properties-recordedat.md "undefined#/properties/recordedAt")

### recordedAt Type

`string`

### recordedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
