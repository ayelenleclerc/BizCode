# SuperadminTenantDetailEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminTenantDetailEnvelope.schema.json](../schema-json/SuperadminTenantDetailEnvelope.schema.json "open original schema") |

## SuperadminTenantDetailEnvelope Type

`object` ([SuperadminTenantDetailEnvelope](superadmintenantdetailenvelope.md))

# SuperadminTenantDetailEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SuperadminTenantDetailEnvelope](superadmintenantdetail.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [SuperadminTenantDetailEnvelope](superadmintenantdetailenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SuperadminTenantDetail](superadmintenantdetail.md))

* cannot be null

* defined in: [SuperadminTenantDetailEnvelope](superadmintenantdetail.md "undefined#/properties/data")

### data Type

`object` ([SuperadminTenantDetail](superadmintenantdetail.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SuperadminTenantDetailEnvelope](superadmintenantdetailenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
