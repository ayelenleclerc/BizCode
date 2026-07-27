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
| [data](#data)       | Merged    | Required | cannot be null | [LoginEnvelope](loginenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LoginEnvelope](loginenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](loginenvelope-properties-data.md))

* cannot be null

* defined in: [LoginEnvelope](loginenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](loginenvelope-properties-data.md))

one (and only one) of

* [LoginResult](loginresult.md "check type definition")

* [LoginMfaChallenge](loginmfachallenge.md "check type definition")

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
