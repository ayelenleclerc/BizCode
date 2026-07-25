# LoteEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteEnvelope.schema.json](../schema-json/LoteEnvelope.schema.json "open original schema") |

## LoteEnvelope Type

`object` ([LoteEnvelope](loteenvelope.md))

# LoteEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                         |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LoteEnvelope](lote.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [LoteEnvelope](loteenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Lote](lote.md))

* cannot be null

* defined in: [LoteEnvelope](lote.md "undefined#/properties/data")

### data Type

`object` ([Lote](lote.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoteEnvelope](loteenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
