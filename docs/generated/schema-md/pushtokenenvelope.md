# PushTokenEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PushTokenEnvelope.schema.json](../schema-json/PushTokenEnvelope.schema.json "open original schema") |

## PushTokenEnvelope Type

`object` ([PushTokenEnvelope](pushtokenenvelope.md))

# PushTokenEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PushTokenEnvelope](pushtokenenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PushTokenEnvelope](pushtokenenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](pushtokenenvelope-properties-data.md))

* cannot be null

* defined in: [PushTokenEnvelope](pushtokenenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](pushtokenenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PushTokenEnvelope](pushtokenenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
