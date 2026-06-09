# RetencionesPreviewEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RetencionesPreviewEnvelope.schema.json](../schema-json/RetencionesPreviewEnvelope.schema.json "open original schema") |

## RetencionesPreviewEnvelope Type

`object` ([RetencionesPreviewEnvelope](retencionespreviewenvelope.md))

# RetencionesPreviewEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RetencionesPreviewEnvelope](retencionespreviewresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [RetencionesPreviewEnvelope](retencionespreviewenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RetencionesPreviewResult](retencionespreviewresult.md))

* cannot be null

* defined in: [RetencionesPreviewEnvelope](retencionespreviewresult.md "undefined#/properties/data")

### data Type

`object` ([RetencionesPreviewResult](retencionespreviewresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RetencionesPreviewEnvelope](retencionespreviewenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
