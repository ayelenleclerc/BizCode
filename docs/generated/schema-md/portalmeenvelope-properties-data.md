# Untitled object in PortalMeEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalMeEnvelope.schema.json\*](../schema-json/PortalMeEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](portalmeenvelope-properties-data.md))

# data Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                             |
| :-------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [branding](#branding) | `object` | Required | cannot be null | [PortalMeEnvelope](portalbranding.md "undefined#/properties/data/properties/branding") |
| [me](#me)             | `object` | Required | cannot be null | [PortalMeEnvelope](portalme.md "undefined#/properties/data/properties/me")             |

## branding



`branding`

* is required

* Type: `object` ([PortalBranding](portalbranding.md))

* cannot be null

* defined in: [PortalMeEnvelope](portalbranding.md "undefined#/properties/data/properties/branding")

### branding Type

`object` ([PortalBranding](portalbranding.md))

## me



`me`

* is required

* Type: `object` ([PortalMe](portalme.md))

* cannot be null

* defined in: [PortalMeEnvelope](portalme.md "undefined#/properties/data/properties/me")

### me Type

`object` ([PortalMe](portalme.md))
