# DocumentoCompraTemplateSummary Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraTemplateSummary.schema.json](../schema-json/DocumentoCompraTemplateSummary.schema.json "open original schema") |

## DocumentoCompraTemplateSummary Type

`object` ([DocumentoCompraTemplateSummary](documentocompratemplatesummary.md))

# DocumentoCompraTemplateSummary Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                               |
| :-------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [issuer](#issuer)     | `string` | Required | cannot be null | [DocumentoCompraTemplateSummary](documentocompratemplatesummary-properties-issuer.md "undefined#/properties/issuer")     |
| [keywords](#keywords) | `array`  | Required | cannot be null | [DocumentoCompraTemplateSummary](documentocompratemplatesummary-properties-keywords.md "undefined#/properties/keywords") |
| [source](#source)     | `string` | Required | cannot be null | [DocumentoCompraTemplateSummary](documentocompratemplatesummary-properties-source.md "undefined#/properties/source")     |

## issuer



`issuer`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraTemplateSummary](documentocompratemplatesummary-properties-issuer.md "undefined#/properties/issuer")

### issuer Type

`string`

## keywords



`keywords`

* is required

* Type: `string[]`

* cannot be null

* defined in: [DocumentoCompraTemplateSummary](documentocompratemplatesummary-properties-keywords.md "undefined#/properties/keywords")

### keywords Type

`string[]`

## source



`source`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraTemplateSummary](documentocompratemplatesummary-properties-source.md "undefined#/properties/source")

### source Type

`string`

### source Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"bundled"` |             |
| `"custom"`  |             |
