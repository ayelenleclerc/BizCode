# PortalFidelizacionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalFidelizacionEnvelope.schema.json](../schema-json/PortalFidelizacionEnvelope.schema.json "open original schema") |

## PortalFidelizacionEnvelope Type

`object` ([PortalFidelizacionEnvelope](portalfidelizacionenvelope.md))

# PortalFidelizacionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PortalFidelizacionEnvelope](portalfidelizacionsummary.md "undefined#/properties/data")                        |
| [success](#success) | `boolean` | Required | cannot be null | [PortalFidelizacionEnvelope](portalfidelizacionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PortalFidelizacionSummary](portalfidelizacionsummary.md))

* cannot be null

* defined in: [PortalFidelizacionEnvelope](portalfidelizacionsummary.md "undefined#/properties/data")

### data Type

`object` ([PortalFidelizacionSummary](portalfidelizacionsummary.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PortalFidelizacionEnvelope](portalfidelizacionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
