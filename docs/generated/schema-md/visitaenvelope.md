# VisitaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VisitaEnvelope.schema.json](../schema-json/VisitaEnvelope.schema.json "open original schema") |

## VisitaEnvelope Type

`object` ([VisitaEnvelope](visitaenvelope.md))

# VisitaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [VisitaEnvelope](visita.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [VisitaEnvelope](visitaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Visita](visita.md))

* cannot be null

* defined in: [VisitaEnvelope](visita.md "undefined#/properties/data")

### data Type

`object` ([Visita](visita.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [VisitaEnvelope](visitaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
