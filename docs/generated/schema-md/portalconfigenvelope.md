# PortalConfigEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalConfigEnvelope.schema.json](../schema-json/PortalConfigEnvelope.schema.json "open original schema") |

## PortalConfigEnvelope Type

`object` ([PortalConfigEnvelope](portalconfigenvelope.md))

# PortalConfigEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PortalConfigEnvelope](portalconfig.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PortalConfigEnvelope](portalconfigenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PortalConfig](portalconfig.md))

* cannot be null

* defined in: [PortalConfigEnvelope](portalconfig.md "undefined#/properties/data")

### data Type

`object` ([PortalConfig](portalconfig.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PortalConfigEnvelope](portalconfigenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
