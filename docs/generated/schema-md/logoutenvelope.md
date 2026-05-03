# LogoutEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LogoutEnvelope.schema.json](../schema-json/LogoutEnvelope.schema.json "open original schema") |

## LogoutEnvelope Type

`object` ([LogoutEnvelope](logoutenvelope.md))

# LogoutEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LogoutEnvelope](logoutresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [LogoutEnvelope](logoutenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LogoutResult](logoutresult.md))

* cannot be null

* defined in: [LogoutEnvelope](logoutresult.md "undefined#/properties/data")

### data Type

`object` ([LogoutResult](logoutresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LogoutEnvelope](logoutenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
