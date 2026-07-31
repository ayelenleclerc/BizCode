# CuentaBancariaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CuentaBancariaEnvelope.schema.json](../schema-json/CuentaBancariaEnvelope.schema.json "open original schema") |

## CuentaBancariaEnvelope Type

`object` ([CuentaBancariaEnvelope](cuentabancariaenvelope.md))

# CuentaBancariaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CuentaBancariaEnvelope](cuentabancaria.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [CuentaBancariaEnvelope](cuentabancariaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([CuentaBancaria](cuentabancaria.md))

* cannot be null

* defined in: [CuentaBancariaEnvelope](cuentabancaria.md "undefined#/properties/data")

### data Type

`object` ([CuentaBancaria](cuentabancaria.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CuentaBancariaEnvelope](cuentabancariaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`
