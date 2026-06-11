# PresentacionPreviewEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionPreviewEnvelope.schema.json](../schema-json/PresentacionPreviewEnvelope.schema.json "open original schema") |

## PresentacionPreviewEnvelope Type

`object` ([PresentacionPreviewEnvelope](presentacionpreviewenvelope.md))

# PresentacionPreviewEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PresentacionPreviewEnvelope](presentacionpreview.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PresentacionPreviewEnvelope](presentacionpreviewenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PresentacionPreview](presentacionpreview.md))

* cannot be null

* defined in: [PresentacionPreviewEnvelope](presentacionpreview.md "undefined#/properties/data")

### data Type

`object` ([PresentacionPreview](presentacionpreview.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionPreviewEnvelope](presentacionpreviewenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
