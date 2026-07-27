# LoginSuccessEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoginSuccessEnvelope.schema.json](../schema-json/LoginSuccessEnvelope.schema.json "open original schema") |

## LoginSuccessEnvelope Type

`object` ([LoginSuccessEnvelope](loginsuccessenvelope.md))

# LoginSuccessEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LoginSuccessEnvelope](loginresult.md "undefined#/properties/data")                                |
| [success](#success) | `boolean` | Required | cannot be null | [LoginSuccessEnvelope](loginsuccessenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LoginResult](loginresult.md))

* cannot be null

* defined in: [LoginSuccessEnvelope](loginresult.md "undefined#/properties/data")

### data Type

`object` ([LoginResult](loginresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoginSuccessEnvelope](loginsuccessenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
