# ProveedorCuentaCorriente Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCuentaCorrienteEnvelope.schema.json\*](../schema-json/ProveedorCuentaCorrienteEnvelope.schema.json "open original schema") |

## data Type

`object` ([ProveedorCuentaCorriente](proveedorcuentacorriente.md))

# data Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [codigo](#codigo)               | `integer` | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-codigo.md "undefined#/properties/codigo")               |
| [excedeLimite](#excedelimite)   | `boolean` | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-excedelimite.md "undefined#/properties/excedeLimite")   |
| [limiteCredito](#limitecredito) | `string`  | Optional | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-limitecredito.md "undefined#/properties/limiteCredito") |
| [movimientos](#movimientos)     | `array`   | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-movimientos.md "undefined#/properties/movimientos")     |
| [proveedorId](#proveedorid)     | `integer` | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-proveedorid.md "undefined#/properties/proveedorId")     |
| [rsocial](#rsocial)             | `string`  | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-rsocial.md "undefined#/properties/rsocial")             |
| [saldo](#saldo)                 | `string`  | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-saldo.md "undefined#/properties/saldo")                 |
| [serie](#serie)                 | `array`   | Required | cannot be null | [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-serie.md "undefined#/properties/serie")                 |

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

## excedeLimite



`excedeLimite`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-excedelimite.md "undefined#/properties/excedeLimite")

### excedeLimite Type

`boolean`

## limiteCredito



`limiteCredito`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-limitecredito.md "undefined#/properties/limiteCredito")

### limiteCredito Type

`string`

## movimientos



`movimientos`

* is required

* Type: `object[]` ([MovimientoProveedorCC](movimientoproveedorcc.md))

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-movimientos.md "undefined#/properties/movimientos")

### movimientos Type

`object[]` ([MovimientoProveedorCC](movimientoproveedorcc.md))

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`

## saldo



`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`

## serie



`serie`

* is required

* Type: `object[]` ([ProveedorCuentaCorrienteChartPoint](proveedorcuentacorrientechartpoint.md))

* cannot be null

* defined in: [ProveedorCuentaCorriente](proveedorcuentacorriente-properties-serie.md "undefined#/properties/serie")

### serie Type

`object[]` ([ProveedorCuentaCorrienteChartPoint](proveedorcuentacorrientechartpoint.md))
