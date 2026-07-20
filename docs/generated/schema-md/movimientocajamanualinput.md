# MovimientoCajaManualInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoCajaManualInput.schema.json](../schema-json/MovimientoCajaManualInput.schema.json "open original schema") |

## MovimientoCajaManualInput Type

`object` ([MovimientoCajaManualInput](movimientocajamanualinput.md))

# MovimientoCajaManualInput Properties

| Property                | Type     | Required | Nullable       | Defined by                                                                                                       |
| :---------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [concepto](#concepto)   | `string` | Optional | cannot be null | [MovimientoCajaManualInput](movimientocajamanualinput-properties-concepto.md "undefined#/properties/concepto")   |
| [formaPago](#formapago) | `string` | Optional | cannot be null | [MovimientoCajaManualInput](movimientocajamanualinput-properties-formapago.md "undefined#/properties/formaPago") |
| [importe](#importe)     | `number` | Required | cannot be null | [MovimientoCajaManualInput](movimientocajamanualinput-properties-importe.md "undefined#/properties/importe")     |
| [tipo](#tipo)           | `string` | Required | cannot be null | [MovimientoCajaManualInput](movimientocajamanualinput-properties-tipo.md "undefined#/properties/tipo")           |

## concepto



`concepto`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoCajaManualInput](movimientocajamanualinput-properties-concepto.md "undefined#/properties/concepto")

### concepto Type

`string`

## formaPago



`formaPago`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoCajaManualInput](movimientocajamanualinput-properties-formapago.md "undefined#/properties/formaPago")

### formaPago Type

`string`

### formaPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"efectivo"`      |             |
| `"tarjeta"`       |             |
| `"mp"`            |             |
| `"transferencia"` |             |
| `"otro"`          |             |

## importe



`importe`

* is required

* Type: `number`

* cannot be null

* defined in: [MovimientoCajaManualInput](movimientocajamanualinput-properties-importe.md "undefined#/properties/importe")

### importe Type

`number`

### importe Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoCajaManualInput](movimientocajamanualinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"egreso"`        |             |
| `"ingreso_extra"` |             |
