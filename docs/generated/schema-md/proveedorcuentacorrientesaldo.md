# ProveedorCuentaCorrienteSaldo Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCuentaCorrienteSaldoEnvelope.schema.json\*](../schema-json/ProveedorCuentaCorrienteSaldoEnvelope.schema.json "open original schema") |

## data Type

`object` ([ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo.md))

# data Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [excedeLimite](#excedelimite)   | `boolean` | Required | cannot be null | [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-excedelimite.md "undefined#/properties/excedeLimite")   |
| [limiteCredito](#limitecredito) | `string`  | Optional | cannot be null | [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-limitecredito.md "undefined#/properties/limiteCredito") |
| [proveedorId](#proveedorid)     | `integer` | Required | cannot be null | [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-proveedorid.md "undefined#/properties/proveedorId")     |
| [saldo](#saldo)                 | `string`  | Required | cannot be null | [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-saldo.md "undefined#/properties/saldo")                 |

## excedeLimite



`excedeLimite`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-excedelimite.md "undefined#/properties/excedeLimite")

### excedeLimite Type

`boolean`

## limiteCredito



`limiteCredito`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-limitecredito.md "undefined#/properties/limiteCredito")

### limiteCredito Type

`string`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## saldo



`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`
