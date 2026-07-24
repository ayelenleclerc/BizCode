# FormulaProduccionUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormulaProduccionUpdateInput.schema.json](../schema-json/FormulaProduccionUpdateInput.schema.json "open original schema") |

## FormulaProduccionUpdateInput Type

`object` ([FormulaProduccionUpdateInput](formulaproduccionupdateinput.md))

# FormulaProduccionUpdateInput Properties

| Property                                | Type     | Required | Nullable       | Defined by                                                                                                                             |
| :-------------------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [insumos](#insumos)                     | `array`  | Required | cannot be null | [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-insumos.md "undefined#/properties/insumos")                     |
| [observaciones](#observaciones)         | `string` | Optional | cannot be null | [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-observaciones.md "undefined#/properties/observaciones")         |
| [rendimiento](#rendimiento)             | `number` | Required | cannot be null | [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-rendimiento.md "undefined#/properties/rendimiento")             |
| [unidadRendimiento](#unidadrendimiento) | `string` | Optional | cannot be null | [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-unidadrendimiento.md "undefined#/properties/unidadRendimiento") |

## insumos



`insumos`

* is required

* Type: `object[]` ([FormulaInsumoInput](formulainsumoinput.md))

* cannot be null

* defined in: [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-insumos.md "undefined#/properties/insumos")

### insumos Type

`object[]` ([FormulaInsumoInput](formulainsumoinput.md))

### insumos Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## rendimiento



`rendimiento`

* is required

* Type: `number`

* cannot be null

* defined in: [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-rendimiento.md "undefined#/properties/rendimiento")

### rendimiento Type

`number`

### rendimiento Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## unidadRendimiento



`unidadRendimiento`

* is optional

* Type: `string`

* cannot be null

* defined in: [FormulaProduccionUpdateInput](formulaproduccionupdateinput-properties-unidadrendimiento.md "undefined#/properties/unidadRendimiento")

### unidadRendimiento Type

`string`

### unidadRendimiento Constraints

**maximum length**: the maximum number of characters for this string is: `12`
