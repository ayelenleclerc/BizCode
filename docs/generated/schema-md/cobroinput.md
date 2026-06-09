# CobroInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroInput.schema.json](../schema-json/CobroInput.schema.json "open original schema") |

## CobroInput Type

`object` ([CobroInput](cobroinput.md))

# CobroInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                             |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)     | `integer` | Required | cannot be null | [CobroInput](cobroinput-properties-clienteid.md "undefined#/properties/clienteId")     |
| [fecha](#fecha)             | `string`  | Required | cannot be null | [CobroInput](cobroinput-properties-fecha.md "undefined#/properties/fecha")             |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [CobroInput](cobroinput-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [monto](#monto)             | `number`  | Required | cannot be null | [CobroInput](cobroinput-properties-monto.md "undefined#/properties/monto")             |
| [nota](#nota)               | `string`  | Optional | cannot be null | [CobroInput](cobroinput-properties-nota.md "undefined#/properties/nota")               |
| [referencia](#referencia)   | `string`  | Optional | cannot be null | [CobroInput](cobroinput-properties-referencia.md "undefined#/properties/referencia")   |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CobroInput](cobroinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## fecha

YYYY-MM-DD or ISO-8601

`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [CobroInput](cobroinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [CobroInput](cobroinput-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## monto



`monto`

* is required

* Type: `number`

* cannot be null

* defined in: [CobroInput](cobroinput-properties-monto.md "undefined#/properties/monto")

### monto Type

`number`

### monto Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [CobroInput](cobroinput-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

### nota Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [CobroInput](cobroinput-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

### referencia Constraints

**maximum length**: the maximum number of characters for this string is: `60`
