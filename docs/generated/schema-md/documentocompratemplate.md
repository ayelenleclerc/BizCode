# DocumentoCompraTemplate Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraTemplateEnvelope.schema.json\*](../schema-json/DocumentoCompraTemplateEnvelope.schema.json "open original schema") |

## data Type

`object` ([DocumentoCompraTemplate](documentocompratemplate.md))

# data Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                 |
| :-------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [fields](#fields)     | `object` | Required | cannot be null | [DocumentoCompraTemplate](documentocompratemplate-properties-fields.md "undefined#/properties/fields")     |
| [issuer](#issuer)     | `string` | Required | cannot be null | [DocumentoCompraTemplate](documentocompratemplate-properties-issuer.md "undefined#/properties/issuer")     |
| [keywords](#keywords) | `array`  | Required | cannot be null | [DocumentoCompraTemplate](documentocompratemplate-properties-keywords.md "undefined#/properties/keywords") |

## fields



`fields`

* is required

* Type: `object` ([Details](documentocompratemplate-properties-fields.md))

* cannot be null

* defined in: [DocumentoCompraTemplate](documentocompratemplate-properties-fields.md "undefined#/properties/fields")

### fields Type

`object` ([Details](documentocompratemplate-properties-fields.md))

## issuer



`issuer`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraTemplate](documentocompratemplate-properties-issuer.md "undefined#/properties/issuer")

### issuer Type

`string`

## keywords



`keywords`

* is required

* Type: `string[]`

* cannot be null

* defined in: [DocumentoCompraTemplate](documentocompratemplate-properties-keywords.md "undefined#/properties/keywords")

### keywords Type

`string[]`
