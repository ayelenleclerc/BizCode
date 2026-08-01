# MeliPublicacionStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliPublicacionStatusEnvelope.schema.json](../schema-json/MeliPublicacionStatusEnvelope.schema.json "open original schema") |

## MeliPublicacionStatusEnvelope Type

`object` ([MeliPublicacionStatusEnvelope](melipublicacionstatusenvelope.md))

# MeliPublicacionStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MeliPublicacionStatusEnvelope](melipublicacionstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MeliPublicacionStatusEnvelope](melipublicacionstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MeliPublicacionStatus](melipublicacionstatus.md))

* cannot be null

* defined in: [MeliPublicacionStatusEnvelope](melipublicacionstatus.md "undefined#/properties/data")

### data Type

`object` ([MeliPublicacionStatus](melipublicacionstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliPublicacionStatusEnvelope](melipublicacionstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
