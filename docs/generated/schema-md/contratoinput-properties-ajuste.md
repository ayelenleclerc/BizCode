# Untitled object in ContratoInput Schema

```txt
undefined#/properties/ajuste
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoInput.schema.json\*](../schema-json/ContratoInput.schema.json "open original schema") |

## ajuste Type

`object` ([Details](contratoinput-properties-ajuste.md))

# ajuste Properties

| Property                              | Type     | Required | Nullable       | Defined by                                                                                                                           |
| :------------------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [frecuenciaAjuste](#frecuenciaajuste) | `string` | Required | cannot be null | [ContratoInput](contratofrecuencia.md "undefined#/properties/ajuste/properties/frecuenciaAjuste")                                    |
| [porcentaje](#porcentaje)             | `number` | Optional | cannot be null | [ContratoInput](contratoinput-properties-ajuste-properties-porcentaje.md "undefined#/properties/ajuste/properties/porcentaje")       |
| [proximoAjuste](#proximoajuste)       | `string` | Required | cannot be null | [ContratoInput](contratoinput-properties-ajuste-properties-proximoajuste.md "undefined#/properties/ajuste/properties/proximoAjuste") |
| [tipo](#tipo)                         | `string` | Required | cannot be null | [ContratoInput](contratoinput-properties-ajuste-properties-tipo.md "undefined#/properties/ajuste/properties/tipo")                   |

## frecuenciaAjuste



`frecuenciaAjuste`

* is required

* Type: `string` ([ContratoFrecuencia](contratofrecuencia.md))

* cannot be null

* defined in: [ContratoInput](contratofrecuencia.md "undefined#/properties/ajuste/properties/frecuenciaAjuste")

### frecuenciaAjuste Type

`string` ([ContratoFrecuencia](contratofrecuencia.md))

### frecuenciaAjuste Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"mensual"`    |             |
| `"bimestral"`  |             |
| `"trimestral"` |             |
| `"semestral"`  |             |
| `"anual"`      |             |

## porcentaje



`porcentaje`

* is optional

* Type: `number`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-ajuste-properties-porcentaje.md "undefined#/properties/ajuste/properties/porcentaje")

### porcentaje Type

`number`

## proximoAjuste



`proximoAjuste`

* is required

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-ajuste-properties-proximoajuste.md "undefined#/properties/ajuste/properties/proximoAjuste")

### proximoAjuste Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-ajuste-properties-tipo.md "undefined#/properties/ajuste/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"porcentaje_fijo"` |             |
| `"manual"`          |             |
