# PortalVerifyEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalVerifyEnvelope.schema.json](../schema-json/PortalVerifyEnvelope.schema.json "open original schema") |

## PortalVerifyEnvelope Type

`object` ([PortalVerifyEnvelope](portalverifyenvelope.md))

# PortalVerifyEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PortalVerifyEnvelope](portalverifyenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PortalVerifyEnvelope](portalverifyenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](portalverifyenvelope-properties-data.md))

* cannot be null

* defined in: [PortalVerifyEnvelope](portalverifyenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](portalverifyenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PortalVerifyEnvelope](portalverifyenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
