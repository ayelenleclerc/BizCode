# FormulaProduccionCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormulaProduccionCreateInput.schema.json](../schema-json/FormulaProduccionCreateInput.schema.json "open original schema") |

## FormulaProduccionCreateInput Type

`object` ([FormulaProduccionCreateInput](formulaproduccioncreateinput.md))

# FormulaProduccionCreateInput Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                                             |
| :-------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)               | `integer` | Required | cannot be null | [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-articuloid.md "undefined#/properties/articuloId")               |
| [insumos](#insumos)                     | `array`   | Required | cannot be null | [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-insumos.md "undefined#/properties/insumos")                     |
| [observaciones](#observaciones)         | `string`  | Optional | cannot be null | [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-observaciones.md "undefined#/properties/observaciones")         |
| [rendimiento](#rendimiento)             | `number`  | Required | cannot be null | [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-rendimiento.md "undefined#/properties/rendimiento")             |
| [unidadRendimiento](#unidadrendimiento) | `string`  | Optional | cannot be null | [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-unidadrendimiento.md "undefined#/properties/unidadRendimiento") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## insumos



`insumos`

* is required

* Type: `object[]` ([FormulaInsumoInput](formulainsumoinput.md))

* cannot be null

* defined in: [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-insumos.md "undefined#/properties/insumos")

### insumos Type

`object[]` ([FormulaInsumoInput](formulainsumoinput.md))

### insumos Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## rendimiento



`rendimiento`

* is required

* Type: `number`

* cannot be null

* defined in: [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-rendimiento.md "undefined#/properties/rendimiento")

### rendimiento Type

`number`

### rendimiento Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## unidadRendimiento



`unidadRendimiento`

* is optional

* Type: `string`

* cannot be null

* defined in: [FormulaProduccionCreateInput](formulaproduccioncreateinput-properties-unidadrendimiento.md "undefined#/properties/unidadRendimiento")

### unidadRendimiento Type

`string`

### unidadRendimiento Constraints

**maximum length**: the maximum number of characters for this string is: `12`
