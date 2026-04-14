# AppUserEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AppUserEnvelope.schema.json](../schema-json/AppUserEnvelope.schema.json "open original schema") |

## AppUserEnvelope Type

`object` ([AppUserEnvelope](appuserenvelope.md))

# AppUserEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [AppUserEnvelope](appuser.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [AppUserEnvelope](appuserenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([AppUser](appuser.md))

* cannot be null

* defined in: [AppUserEnvelope](appuser.md "undefined#/properties/data")

### data Type

`object` ([AppUser](appuser.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AppUserEnvelope](appuserenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
