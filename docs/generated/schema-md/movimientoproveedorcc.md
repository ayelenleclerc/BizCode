# MovimientoProveedorCC Schema

```txt
undefined#/properties/movimientos/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCuentaCorriente.schema.json\*](../schema-json/ProveedorCuentaCorriente.schema.json "open original schema") |

## items Type

`object` ([MovimientoProveedorCC](movimientoproveedorcc.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [fecha](#fecha)           | `string`  | Required | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-fecha.md "undefined#/properties/fecha")           |
| [id](#id)                 | `integer` | Required | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-id.md "undefined#/properties/id")                 |
| [monto](#monto)           | `string`  | Required | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-monto.md "undefined#/properties/monto")           |
| [notas](#notas)           | `string`  | Optional | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-notas.md "undefined#/properties/notas")           |
| [referencia](#referencia) | `string`  | Optional | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-referencia.md "undefined#/properties/referencia") |
| [saldoPost](#saldopost)   | `string`  | Required | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-saldopost.md "undefined#/properties/saldoPost")   |
| [tipo](#tipo)             | `string`  | Required | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-tipo.md "undefined#/properties/tipo")             |
| [usuarioId](#usuarioid)   | `integer` | Required | cannot be null | [MovimientoProveedorCC](movimientoproveedorcc-properties-usuarioid.md "undefined#/properties/usuarioId")   |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## monto



`monto`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-monto.md "undefined#/properties/monto")

### monto Type

`string`

## notas



`notas`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-notas.md "undefined#/properties/notas")

### notas Type

`string`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## saldoPost



`saldoPost`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-saldopost.md "undefined#/properties/saldoPost")

### saldoPost Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"factura_compra"` |             |
| `"pago"`           |             |
| `"nc_proveedor"`   |             |
| `"ajuste"`         |             |

## usuarioId



`usuarioId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoProveedorCC](movimientoproveedorcc-properties-usuarioid.md "undefined#/properties/usuarioId")

### usuarioId Type

`integer`
