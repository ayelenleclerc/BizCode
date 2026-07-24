# FormulaProduccionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormulaProduccionEnvelope.schema.json](../schema-json/FormulaProduccionEnvelope.schema.json "open original schema") |

## FormulaProduccionEnvelope Type

`object` ([FormulaProduccionEnvelope](formulaproduccionenvelope.md))

# FormulaProduccionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FormulaProduccionEnvelope](formulaproduccion.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [FormulaProduccionEnvelope](formulaproduccionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FormulaProduccion](formulaproduccion.md))

* cannot be null

* defined in: [FormulaProduccionEnvelope](formulaproduccion.md "undefined#/properties/data")

### data Type

`object` ([FormulaProduccion](formulaproduccion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FormulaProduccionEnvelope](formulaproduccionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
