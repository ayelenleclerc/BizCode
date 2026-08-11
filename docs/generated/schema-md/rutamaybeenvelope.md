# RutaMaybeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaMaybeEnvelope.schema.json](../schema-json/RutaMaybeEnvelope.schema.json "open original schema") |

## RutaMaybeEnvelope Type

`object` ([RutaMaybeEnvelope](rutamaybeenvelope.md))

# RutaMaybeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [RutaMaybeEnvelope](rutamaybeenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RutaMaybeEnvelope](rutamaybeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](rutamaybeenvelope-properties-data.md))

* cannot be null

* defined in: [RutaMaybeEnvelope](rutamaybeenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](rutamaybeenvelope-properties-data.md))

one (and only one) of

* [Ruta](ruta.md "check type definition")

* [Untitled null in RutaMaybeEnvelope](rutamaybeenvelope-properties-data-oneof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RutaMaybeEnvelope](rutamaybeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
