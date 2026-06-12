# PortalBrandingEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalBrandingEnvelope.schema.json](../schema-json/PortalBrandingEnvelope.schema.json "open original schema") |

## PortalBrandingEnvelope Type

`object` ([PortalBrandingEnvelope](portalbrandingenvelope.md))

# PortalBrandingEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PortalBrandingEnvelope](portalbranding.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PortalBrandingEnvelope](portalbrandingenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PortalBranding](portalbranding.md))

* cannot be null

* defined in: [PortalBrandingEnvelope](portalbranding.md "undefined#/properties/data")

### data Type

`object` ([PortalBranding](portalbranding.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PortalBrandingEnvelope](portalbrandingenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
