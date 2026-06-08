# DocumentoCompraTemplateListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraTemplateListEnvelope.schema.json](../schema-json/DocumentoCompraTemplateListEnvelope.schema.json "open original schema") |

## DocumentoCompraTemplateListEnvelope Type

`object` ([DocumentoCompraTemplateListEnvelope](documentocompratemplatelistenvelope.md))

# DocumentoCompraTemplateListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [DocumentoCompraTemplateListEnvelope](documentocompratemplatelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [DocumentoCompraTemplateListEnvelope](documentocompratemplatelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([DocumentoCompraTemplateSummary](documentocompratemplatesummary.md))

* cannot be null

* defined in: [DocumentoCompraTemplateListEnvelope](documentocompratemplatelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([DocumentoCompraTemplateSummary](documentocompratemplatesummary.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraTemplateListEnvelope](documentocompratemplatelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
