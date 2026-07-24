# TipoCambioManualInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TipoCambioManualInput.schema.json](../schema-json/TipoCambioManualInput.schema.json "open original schema") |

## TipoCambioManualInput Type

`object` ([TipoCambioManualInput](tipocambiomanualinput.md))

# TipoCambioManualInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                         |
| :---------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [fecha](#fecha)   | `string` | Optional | cannot be null | [TipoCambioManualInput](tipocambiomanualinput-properties-fecha.md "undefined#/properties/fecha")   |
| [moneda](#moneda) | `string` | Required | cannot be null | [TipoCambioManualInput](tipocambiomanualinput-properties-moneda.md "undefined#/properties/moneda") |
| [tipo](#tipo)     | `string` | Required | cannot be null | [TipoCambioManualInput](tipocambiomanualinput-properties-tipo.md "undefined#/properties/tipo")     |
| [valor](#valor)   | `number` | Required | cannot be null | [TipoCambioManualInput](tipocambiomanualinput-properties-valor.md "undefined#/properties/valor")   |

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [TipoCambioManualInput](tipocambiomanualinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambioManualInput](tipocambiomanualinput-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value   | Explanation |
| :------ | :---------- |
| `"USD"` |             |
| `"EUR"` |             |

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambioManualInput](tipocambiomanualinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"oficial"` |             |
| `"mep"`     |             |
| `"ccl"`     |             |
| `"blue"`    |             |
| `"manual"`  |             |

## valor



`valor`

* is required

* Type: `number`

* cannot be null

* defined in: [TipoCambioManualInput](tipocambiomanualinput-properties-valor.md "undefined#/properties/valor")

### valor Type

`number`

### valor Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`
