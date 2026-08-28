# ClienteCuentaCorrienteSaldo Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteSaldoEnvelope.schema.json\*](../schema-json/ClienteCuentaCorrienteSaldoEnvelope.schema.json "open original schema") |

## data Type

`object` ([ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo.md))

# data Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)             | `integer` | Required | cannot be null | [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-clienteid.md "undefined#/properties/clienteId")             |
| [creditLimit](#creditlimit)         | `string`  | Optional | cannot be null | [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-creditlimit.md "undefined#/properties/creditLimit")         |
| [excedeLimite](#excedelimite)       | `boolean` | Required | cannot be null | [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-excedelimite.md "undefined#/properties/excedeLimite")       |
| [saldo](#saldo)                     | `string`  | Required | cannot be null | [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-saldo.md "undefined#/properties/saldo")                     |
| [saldosPorMoneda](#saldospormoneda) | `array`   | Required | cannot be null | [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-saldospormoneda.md "undefined#/properties/saldosPorMoneda") |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## creditLimit



`creditLimit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-creditlimit.md "undefined#/properties/creditLimit")

### creditLimit Type

`string`

## excedeLimite



`excedeLimite`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-excedelimite.md "undefined#/properties/excedeLimite")

### excedeLimite Type

`boolean`

## saldo

Local-currency balance; drives the credit limit check.

`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`

## saldosPorMoneda

Running balance per currency (#206).

`saldosPorMoneda`

* is required

* Type: `object[]` ([SaldoPorMoneda](saldopormoneda.md))

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo-properties-saldospormoneda.md "undefined#/properties/saldosPorMoneda")

### saldosPorMoneda Type

`object[]` ([SaldoPorMoneda](saldopormoneda.md))
