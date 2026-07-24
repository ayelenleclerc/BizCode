# FormulaInsumoInput Schema

```txt
undefined#/properties/insumos/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormulaProduccionUpdateInput.schema.json\*](../schema-json/FormulaProduccionUpdateInput.schema.json "open original schema") |

## items Type

`object` ([FormulaInsumoInput](formulainsumoinput.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [FormulaInsumoInput](formulainsumoinput-properties-articuloid.md "undefined#/properties/articuloId") |
| [cantidad](#cantidad)     | `number`  | Required | cannot be null | [FormulaInsumoInput](formulainsumoinput-properties-cantidad.md "undefined#/properties/cantidad")     |
| [esOpcional](#esopcional) | `boolean` | Optional | cannot be null | [FormulaInsumoInput](formulainsumoinput-properties-esopcional.md "undefined#/properties/esOpcional") |
| [orden](#orden)           | `integer` | Optional | cannot be null | [FormulaInsumoInput](formulainsumoinput-properties-orden.md "undefined#/properties/orden")           |
| [unidad](#unidad)         | `string`  | Required | cannot be null | [FormulaInsumoInput](formulainsumoinput-properties-unidad.md "undefined#/properties/unidad")         |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FormulaInsumoInput](formulainsumoinput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [FormulaInsumoInput](formulainsumoinput-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

### cantidad Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## esOpcional



`esOpcional`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [FormulaInsumoInput](formulainsumoinput-properties-esopcional.md "undefined#/properties/esOpcional")

### esOpcional Type

`boolean`

## orden



`orden`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FormulaInsumoInput](formulainsumoinput-properties-orden.md "undefined#/properties/orden")

### orden Type

`integer`

### orden Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## unidad



`unidad`

* is required

* Type: `string`

* cannot be null

* defined in: [FormulaInsumoInput](formulainsumoinput-properties-unidad.md "undefined#/properties/unidad")

### unidad Type

`string`

### unidad Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"kg"`     |             |
| `"g"`      |             |
| `"l"`      |             |
| `"ml"`     |             |
| `"unidad"` |             |
| `"hora"`   |             |
