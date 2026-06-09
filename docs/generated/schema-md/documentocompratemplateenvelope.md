# DocumentoCompraTemplateEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraTemplateEnvelope.schema.json](../schema-json/DocumentoCompraTemplateEnvelope.schema.json "open original schema") |

## DocumentoCompraTemplateEnvelope Type

`object` ([DocumentoCompraTemplateEnvelope](documentocompratemplateenvelope.md))

# DocumentoCompraTemplateEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DocumentoCompraTemplateEnvelope](documentocompratemplate.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [DocumentoCompraTemplateEnvelope](documentocompratemplateenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DocumentoCompraTemplate](documentocompratemplate.md))

* cannot be null

* defined in: [DocumentoCompraTemplateEnvelope](documentocompratemplate.md "undefined#/properties/data")

### data Type

`object` ([DocumentoCompraTemplate](documentocompratemplate.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraTemplateEnvelope](documentocompratemplateenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
