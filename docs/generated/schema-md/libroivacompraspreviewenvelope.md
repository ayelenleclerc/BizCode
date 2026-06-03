# LibroIvaComprasPreviewEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroIvaComprasPreviewEnvelope.schema.json](../schema-json/LibroIvaComprasPreviewEnvelope.schema.json "open original schema") |

## LibroIvaComprasPreviewEnvelope Type

`object` ([LibroIvaComprasPreviewEnvelope](libroivacompraspreviewenvelope.md))

# LibroIvaComprasPreviewEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LibroIvaComprasPreviewEnvelope](libroivacompraspreview.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [LibroIvaComprasPreviewEnvelope](libroivacompraspreviewenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LibroIvaComprasPreview](libroivacompraspreview.md))

* cannot be null

* defined in: [LibroIvaComprasPreviewEnvelope](libroivacompraspreview.md "undefined#/properties/data")

### data Type

`object` ([LibroIvaComprasPreview](libroivacompraspreview.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LibroIvaComprasPreviewEnvelope](libroivacompraspreviewenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
