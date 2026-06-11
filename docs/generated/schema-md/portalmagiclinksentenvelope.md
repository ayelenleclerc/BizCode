# PortalMagicLinkSentEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalMagicLinkSentEnvelope.schema.json](../schema-json/PortalMagicLinkSentEnvelope.schema.json "open original schema") |

## PortalMagicLinkSentEnvelope Type

`object` ([PortalMagicLinkSentEnvelope](portalmagiclinksentenvelope.md))

# PortalMagicLinkSentEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PortalMagicLinkSentEnvelope](portalmagiclinksentenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PortalMagicLinkSentEnvelope](portalmagiclinksentenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](portalmagiclinksentenvelope-properties-data.md))

* cannot be null

* defined in: [PortalMagicLinkSentEnvelope](portalmagiclinksentenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](portalmagiclinksentenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PortalMagicLinkSentEnvelope](portalmagiclinksentenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
