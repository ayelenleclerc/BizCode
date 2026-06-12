# ClienteCuentaCorriente Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteEnvelope.schema.json\*](../schema-json/ClienteCuentaCorrienteEnvelope.schema.json "open original schema") |

## data Type

`object` ([ClienteCuentaCorriente](clientecuentacorriente.md))

# data Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                       |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)       | `integer` | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-clienteid.md "undefined#/properties/clienteId")       |
| [codigo](#codigo)             | `integer` | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-codigo.md "undefined#/properties/codigo")             |
| [creditLimit](#creditlimit)   | `string`  | Optional | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-creditlimit.md "undefined#/properties/creditLimit")   |
| [excedeLimite](#excedelimite) | `boolean` | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-excedelimite.md "undefined#/properties/excedeLimite") |
| [limit](#limit)               | `integer` | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-limit.md "undefined#/properties/limit")               |
| [movimientos](#movimientos)   | `array`   | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-movimientos.md "undefined#/properties/movimientos")   |
| [offset](#offset)             | `integer` | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-offset.md "undefined#/properties/offset")             |
| [rsocial](#rsocial)           | `string`  | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-rsocial.md "undefined#/properties/rsocial")           |
| [saldo](#saldo)               | `string`  | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-saldo.md "undefined#/properties/saldo")               |
| [serie](#serie)               | `array`   | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-serie.md "undefined#/properties/serie")               |
| [total](#total)               | `integer` | Required | cannot be null | [ClienteCuentaCorriente](clientecuentacorriente-properties-total.md "undefined#/properties/total")               |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

## creditLimit



`creditLimit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-creditlimit.md "undefined#/properties/creditLimit")

### creditLimit Type

`string`

## excedeLimite



`excedeLimite`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-excedelimite.md "undefined#/properties/excedeLimite")

### excedeLimite Type

`boolean`

## limit



`limit`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-limit.md "undefined#/properties/limit")

### limit Type

`integer`

## movimientos



`movimientos`

* is required

* Type: `object[]` ([MovimientoClienteCC](movimientoclientecc.md))

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-movimientos.md "undefined#/properties/movimientos")

### movimientos Type

`object[]` ([MovimientoClienteCC](movimientoclientecc.md))

## offset



`offset`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-offset.md "undefined#/properties/offset")

### offset Type

`integer`

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`

## saldo



`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`

## serie



`serie`

* is required

* Type: `object[]` ([ClienteCuentaCorrienteChartPoint](clientecuentacorrientechartpoint.md))

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-serie.md "undefined#/properties/serie")

### serie Type

`object[]` ([ClienteCuentaCorrienteChartPoint](clientecuentacorrientechartpoint.md))

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorriente](clientecuentacorriente-properties-total.md "undefined#/properties/total")

### total Type

`integer`
