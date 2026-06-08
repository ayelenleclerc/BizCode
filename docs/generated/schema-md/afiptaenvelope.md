# ArcaTaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaTaEnvelope.schema.json](../schema-json/ArcaTaEnvelope.schema.json "open original schema") |

## ArcaTaEnvelope Type

`object` ([ArcaTaEnvelope](afiptaenvelope.md))

# ArcaTaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ArcaTaEnvelope](afiptaenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ArcaTaEnvelope](afiptaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](afiptaenvelope-properties-data.md))

* cannot be null

* defined in: [ArcaTaEnvelope](afiptaenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](afiptaenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArcaTaEnvelope](afiptaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
