# LoginEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoginEnvelope.schema.json](../schema-json/LoginEnvelope.schema.json "open original schema") |

## LoginEnvelope Type

`object` ([LoginEnvelope](loginenvelope.md))

# LoginEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LoginEnvelope](loginresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [LoginEnvelope](loginenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LoginResult](loginresult.md))

* cannot be null

* defined in: [LoginEnvelope](loginresult.md "undefined#/properties/data")

### data Type

`object` ([LoginResult](loginresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoginEnvelope](loginenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
