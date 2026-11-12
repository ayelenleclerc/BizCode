# FcemStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FcemStatusEnvelope.schema.json](../schema-json/FcemStatusEnvelope.schema.json "open original schema") |

## FcemStatusEnvelope Type

`object` ([FcemStatusEnvelope](fcemstatusenvelope.md))

# FcemStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FcemStatusEnvelope](fcemstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [FcemStatusEnvelope](fcemstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FcemStatus](fcemstatus.md))

* cannot be null

* defined in: [FcemStatusEnvelope](fcemstatus.md "undefined#/properties/data")

### data Type

`object` ([FcemStatus](fcemstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FcemStatusEnvelope](fcemstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
