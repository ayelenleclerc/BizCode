# CuentaCorriente Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CuentaCorrienteEnvelope.schema.json\*](../schema-json/CuentaCorrienteEnvelope.schema.json "open original schema") |

## data Type

`object` ([CuentaCorriente](cuentacorriente.md))

# data Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [balanceActual](#balanceactual) | `string`  | Required | cannot be null | [CuentaCorriente](cuentacorriente-properties-balanceactual.md "undefined#/properties/balanceActual") |
| [clienteId](#clienteid)         | `integer` | Required | cannot be null | [CuentaCorriente](cuentacorriente-properties-clienteid.md "undefined#/properties/clienteId")         |
| [codigo](#codigo)               | `integer` | Required | cannot be null | [CuentaCorriente](cuentacorriente-properties-codigo.md "undefined#/properties/codigo")               |
| [lineas](#lineas)               | `array`   | Required | cannot be null | [CuentaCorriente](cuentacorriente-properties-lineas.md "undefined#/properties/lineas")               |
| [rsocial](#rsocial)             | `string`  | Required | cannot be null | [CuentaCorriente](cuentacorriente-properties-rsocial.md "undefined#/properties/rsocial")             |

## balanceActual



`balanceActual`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorriente](cuentacorriente-properties-balanceactual.md "undefined#/properties/balanceActual")

### balanceActual Type

`string`

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CuentaCorriente](cuentacorriente-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [CuentaCorriente](cuentacorriente-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

## lineas



`lineas`

* is required

* Type: `object[]` ([CuentaCorrienteLine](cuentacorrienteline.md))

* cannot be null

* defined in: [CuentaCorriente](cuentacorriente-properties-lineas.md "undefined#/properties/lineas")

### lineas Type

`object[]` ([CuentaCorrienteLine](cuentacorrienteline.md))

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaCorriente](cuentacorriente-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`
