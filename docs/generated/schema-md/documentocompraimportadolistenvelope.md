# DocumentoCompraImportadoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraImportadoListEnvelope.schema.json](../schema-json/DocumentoCompraImportadoListEnvelope.schema.json "open original schema") |

## DocumentoCompraImportadoListEnvelope Type

`object` ([DocumentoCompraImportadoListEnvelope](documentocompraimportadolistenvelope.md))

# DocumentoCompraImportadoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [DocumentoCompraImportadoListEnvelope](documentocompraimportadolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [DocumentoCompraImportadoListEnvelope](documentocompraimportadolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([DocumentoCompraImportado](documentocompraimportado.md))

* cannot be null

* defined in: [DocumentoCompraImportadoListEnvelope](documentocompraimportadolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([DocumentoCompraImportado](documentocompraimportado.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraImportadoListEnvelope](documentocompraimportadolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
