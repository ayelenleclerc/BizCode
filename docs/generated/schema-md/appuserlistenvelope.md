# AppUserListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AppUserListEnvelope.schema.json](../schema-json/AppUserListEnvelope.schema.json "open original schema") |

## AppUserListEnvelope Type

`object` ([AppUserListEnvelope](appuserlistenvelope.md))

# AppUserListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [AppUserListEnvelope](appuserlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [AppUserListEnvelope](appuserlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([AppUser](appuser.md))

* cannot be null

* defined in: [AppUserListEnvelope](appuserlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([AppUser](appuser.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AppUserListEnvelope](appuserlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
