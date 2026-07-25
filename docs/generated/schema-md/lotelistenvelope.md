# LoteListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteListEnvelope.schema.json](../schema-json/LoteListEnvelope.schema.json "open original schema") |

## LoteListEnvelope Type

`object` ([LoteListEnvelope](lotelistenvelope.md))

# LoteListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [LoteListEnvelope](lotelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LoteListEnvelope](lotelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Lote](lote.md))

* cannot be null

* defined in: [LoteListEnvelope](lotelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Lote](lote.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoteListEnvelope](lotelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
