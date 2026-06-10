# MovimientoClienteCC Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoClienteCCEnvelope.schema.json\*](../schema-json/MovimientoClienteCCEnvelope.schema.json "open original schema") |

## data Type

`object` ([MovimientoClienteCC](movimientoclientecc.md))

# data Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [chequeId](#chequeid)                       | `integer` | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-chequeid.md "undefined#/properties/chequeId")                       |
| [cobroId](#cobroid)                         | `integer` | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-cobroid.md "undefined#/properties/cobroId")                         |
| [facturaId](#facturaid)                     | `integer` | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-facturaid.md "undefined#/properties/facturaId")                     |
| [fecha](#fecha)                             | `string`  | Required | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-fecha.md "undefined#/properties/fecha")                             |
| [id](#id)                                   | `integer` | Required | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-id.md "undefined#/properties/id")                                   |
| [monto](#monto)                             | `string`  | Required | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-monto.md "undefined#/properties/monto")                             |
| [notaCreditoId](#notacreditoid)             | `integer` | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-notacreditoid.md "undefined#/properties/notaCreditoId")             |
| [notas](#notas)                             | `string`  | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-notas.md "undefined#/properties/notas")                             |
| [referencia](#referencia)                   | `string`  | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-referencia.md "undefined#/properties/referencia")                   |
| [retencionAplicadaId](#retencionaplicadaid) | `integer` | Optional | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-retencionaplicadaid.md "undefined#/properties/retencionAplicadaId") |
| [saldoPost](#saldopost)                     | `string`  | Required | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-saldopost.md "undefined#/properties/saldoPost")                     |
| [tipo](#tipo)                               | `string`  | Required | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-tipo.md "undefined#/properties/tipo")                               |
| [usuarioId](#usuarioid)                     | `integer` | Required | cannot be null | [MovimientoClienteCC](movimientoclientecc-properties-usuarioid.md "undefined#/properties/usuarioId")                     |

## chequeId



`chequeId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-chequeid.md "undefined#/properties/chequeId")

### chequeId Type

`integer`

## cobroId



`cobroId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-cobroid.md "undefined#/properties/cobroId")

### cobroId Type

`integer`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## monto



`monto`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-monto.md "undefined#/properties/monto")

### monto Type

`string`

## notaCreditoId



`notaCreditoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-notacreditoid.md "undefined#/properties/notaCreditoId")

### notaCreditoId Type

`integer`

## notas



`notas`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-notas.md "undefined#/properties/notas")

### notas Type

`string`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## retencionAplicadaId



`retencionAplicadaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-retencionaplicadaid.md "undefined#/properties/retencionAplicadaId")

### retencionAplicadaId Type

`integer`

## saldoPost



`saldoPost`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-saldopost.md "undefined#/properties/saldoPost")

### saldoPost Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                | Explanation |
| :------------------- | :---------- |
| `"saldo_inicial"`    |             |
| `"factura"`          |             |
| `"nota_credito"`     |             |
| `"cobro"`            |             |
| `"retencion"`        |             |
| `"percepcion"`       |             |
| `"cheque_rechazado"` |             |
| `"ajuste"`           |             |

## usuarioId



`usuarioId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoClienteCC](movimientoclientecc-properties-usuarioid.md "undefined#/properties/usuarioId")

### usuarioId Type

`integer`
