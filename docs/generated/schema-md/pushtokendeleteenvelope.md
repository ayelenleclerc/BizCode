# PushTokenDeleteEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PushTokenDeleteEnvelope.schema.json](../schema-json/PushTokenDeleteEnvelope.schema.json "open original schema") |

## PushTokenDeleteEnvelope Type

`object` ([PushTokenDeleteEnvelope](pushtokendeleteenvelope.md))

# PushTokenDeleteEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PushTokenDeleteEnvelope](pushtokendeleteenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PushTokenDeleteEnvelope](pushtokendeleteenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](pushtokendeleteenvelope-properties-data.md))

* cannot be null

* defined in: [PushTokenDeleteEnvelope](pushtokendeleteenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](pushtokendeleteenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PushTokenDeleteEnvelope](pushtokendeleteenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
