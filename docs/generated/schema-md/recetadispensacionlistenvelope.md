# RecetaDispensacionListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecetaDispensacionListEnvelope.schema.json](../schema-json/RecetaDispensacionListEnvelope.schema.json "open original schema") |

## RecetaDispensacionListEnvelope Type

`object` ([RecetaDispensacionListEnvelope](recetadispensacionlistenvelope.md))

# RecetaDispensacionListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RecetaDispensacionListEnvelope](recetadispensacionlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RecetaDispensacionListEnvelope](recetadispensacionlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([RecetaDispensacion](recetadispensacion.md))

* cannot be null

* defined in: [RecetaDispensacionListEnvelope](recetadispensacionlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([RecetaDispensacion](recetadispensacion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RecetaDispensacionListEnvelope](recetadispensacionlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
