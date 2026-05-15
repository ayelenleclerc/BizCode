# CuentaCorrienteEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CuentaCorrienteEnvelope.schema.json](../schema-json/CuentaCorrienteEnvelope.schema.json "open original schema") |

## CuentaCorrienteEnvelope Type

`object` ([CuentaCorrienteEnvelope](cuentacorrienteenvelope.md))

# CuentaCorrienteEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CuentaCorrienteEnvelope](cuentacorriente.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [CuentaCorrienteEnvelope](cuentacorrienteenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([CuentaCorriente](cuentacorriente.md))

* cannot be null

* defined in: [CuentaCorrienteEnvelope](cuentacorriente.md "undefined#/properties/data")

### data Type

`object` ([CuentaCorriente](cuentacorriente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CuentaCorrienteEnvelope](cuentacorrienteenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
