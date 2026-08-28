# RecetaDispensacionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecetaDispensacionEnvelope.schema.json](../schema-json/RecetaDispensacionEnvelope.schema.json "open original schema") |

## RecetaDispensacionEnvelope Type

`object` ([RecetaDispensacionEnvelope](recetadispensacionenvelope.md))

# RecetaDispensacionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RecetaDispensacionEnvelope](recetadispensacion.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RecetaDispensacionEnvelope](recetadispensacionenvelope-properties-success.md "undefined#/properties/success") |

## data

Prescription recorded locally when dispensing controlled articles (#204).

`data`

* is required

* Type: `object` ([RecetaDispensacion](recetadispensacion.md))

* cannot be null

* defined in: [RecetaDispensacionEnvelope](recetadispensacion.md "undefined#/properties/data")

### data Type

`object` ([RecetaDispensacion](recetadispensacion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RecetaDispensacionEnvelope](recetadispensacionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
