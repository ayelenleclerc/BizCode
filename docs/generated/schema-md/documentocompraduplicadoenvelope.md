# DocumentoCompraDuplicadoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraDuplicadoEnvelope.schema.json](../schema-json/DocumentoCompraDuplicadoEnvelope.schema.json "open original schema") |

## DocumentoCompraDuplicadoEnvelope Type

`object` ([DocumentoCompraDuplicadoEnvelope](documentocompraduplicadoenvelope.md))

# DocumentoCompraDuplicadoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DocumentoCompraDuplicadoEnvelope](documentocompraduplicadoresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [DocumentoCompraDuplicadoEnvelope](documentocompraduplicadoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DocumentoCompraDuplicadoResult](documentocompraduplicadoresult.md))

* cannot be null

* defined in: [DocumentoCompraDuplicadoEnvelope](documentocompraduplicadoresult.md "undefined#/properties/data")

### data Type

`object` ([DocumentoCompraDuplicadoResult](documentocompraduplicadoresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DocumentoCompraDuplicadoEnvelope](documentocompraduplicadoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
