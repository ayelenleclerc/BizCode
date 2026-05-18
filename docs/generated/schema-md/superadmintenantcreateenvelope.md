# SuperadminTenantCreateEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminTenantCreateEnvelope.schema.json](../schema-json/SuperadminTenantCreateEnvelope.schema.json "open original schema") |

## SuperadminTenantCreateEnvelope Type

`object` ([SuperadminTenantCreateEnvelope](superadmintenantcreateenvelope.md))

# SuperadminTenantCreateEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SuperadminTenantCreateEnvelope](superadmintenantcreateresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [SuperadminTenantCreateEnvelope](superadmintenantcreateenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SuperadminTenantCreateResult](superadmintenantcreateresult.md))

* cannot be null

* defined in: [SuperadminTenantCreateEnvelope](superadmintenantcreateresult.md "undefined#/properties/data")

### data Type

`object` ([SuperadminTenantCreateResult](superadmintenantcreateresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SuperadminTenantCreateEnvelope](superadmintenantcreateenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
