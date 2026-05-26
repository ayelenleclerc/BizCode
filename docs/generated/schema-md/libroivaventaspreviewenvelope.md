# LibroIvaVentasPreviewEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroIvaVentasPreviewEnvelope.schema.json](../schema-json/LibroIvaVentasPreviewEnvelope.schema.json "open original schema") |

## LibroIvaVentasPreviewEnvelope Type

`object` ([LibroIvaVentasPreviewEnvelope](libroivaventaspreviewenvelope.md))

# LibroIvaVentasPreviewEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LibroIvaVentasPreviewEnvelope](libroivaventaspreview.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [LibroIvaVentasPreviewEnvelope](libroivaventaspreviewenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LibroIvaVentasPreview](libroivaventaspreview.md))

* cannot be null

* defined in: [LibroIvaVentasPreviewEnvelope](libroivaventaspreview.md "undefined#/properties/data")

### data Type

`object` ([LibroIvaVentasPreview](libroivaventaspreview.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LibroIvaVentasPreviewEnvelope](libroivaventaspreviewenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
