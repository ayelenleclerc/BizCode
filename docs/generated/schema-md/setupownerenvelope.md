# SetupOwnerEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SetupOwnerEnvelope.schema.json](../schema-json/SetupOwnerEnvelope.schema.json "open original schema") |

## SetupOwnerEnvelope Type

`object` ([SetupOwnerEnvelope](setupownerenvelope.md))

# SetupOwnerEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SetupOwnerEnvelope](setupownerresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [SetupOwnerEnvelope](setupownerenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SetupOwnerResult](setupownerresult.md))

* cannot be null

* defined in: [SetupOwnerEnvelope](setupownerresult.md "undefined#/properties/data")

### data Type

`object` ([SetupOwnerResult](setupownerresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SetupOwnerEnvelope](setupownerenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
