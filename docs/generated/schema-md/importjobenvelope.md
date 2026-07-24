# ImportJobEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ImportJobEnvelope.schema.json](../schema-json/ImportJobEnvelope.schema.json "open original schema") |

## ImportJobEnvelope Type

`object` ([ImportJobEnvelope](importjobenvelope.md))

# ImportJobEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ImportJobEnvelope](importjob.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ImportJobEnvelope](importjobenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ImportJob](importjob.md))

* cannot be null

* defined in: [ImportJobEnvelope](importjob.md "undefined#/properties/data")

### data Type

`object` ([ImportJob](importjob.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ImportJobEnvelope](importjobenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
