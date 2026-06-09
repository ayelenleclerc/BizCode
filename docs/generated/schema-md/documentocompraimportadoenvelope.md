# DocumentoCompraImportadoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraImportadoEnvelope.schema.json](../schema-json/DocumentoCompraImportadoEnvelope.schema.json "open original schema") |

## DocumentoCompraImportadoEnvelope Type

`object` ([DocumentoCompraImportadoEnvelope](documentocompraimportadoenvelope.md))

# DocumentoCompraImportadoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DocumentoCompraImportadoEnvelope](documentocompraimportado.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [DocumentoCompraImportadoEnvelope](documentocompraimportadoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DocumentoCompraImportado](documentocompraimportado.md))

* cannot be null

* defined in: [DocumentoCompraImportadoEnvelope](documentocompraimportado.md "undefined#/properties/data")

### data Type

`object` ([DocumentoCompraImportado](documentocompraimportado.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraImportadoEnvelope](documentocompraimportadoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
