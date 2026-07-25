# MovimientoPuntos Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoPuntos.schema.json](../schema-json/MovimientoPuntos.schema.json "open original schema") |

## MovimientoPuntos Type

`object` ([MovimientoPuntos](movimientopuntos.md))

# MovimientoPuntos Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)                     | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-clienteid.md "undefined#/properties/clienteId")                     |
| [concepto](#concepto)                       | `string`  | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-concepto.md "undefined#/properties/concepto")                       |
| [createdAt](#createdat)                     | `string`  | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-createdat.md "undefined#/properties/createdAt")                     |
| [id](#id)                                   | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-id.md "undefined#/properties/id")                                   |
| [puntos](#puntos)                           | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-puntos.md "undefined#/properties/puntos")                           |
| [puntosRestantes](#puntosrestantes)         | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-puntosrestantes.md "undefined#/properties/puntosRestantes")         |
| [referenciaFacturaId](#referenciafacturaid) | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-referenciafacturaid.md "undefined#/properties/referenciaFacturaId") |
| [saldoPost](#saldopost)                     | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-saldopost.md "undefined#/properties/saldoPost")                     |
| [tenantId](#tenantid)                       | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-tenantid.md "undefined#/properties/tenantId")                       |
| [tipo](#tipo)                               | `string`  | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-tipo.md "undefined#/properties/tipo")                               |
| [userId](#userid)                           | `integer` | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-userid.md "undefined#/properties/userId")                           |
| [venceEn](#venceen)                         | `string`  | Required | cannot be null | [MovimientoPuntos](movimientopuntos-properties-venceen.md "undefined#/properties/venceEn")                         |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## concepto



`concepto`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-concepto.md "undefined#/properties/concepto")

### concepto Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## puntos



`puntos`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-puntos.md "undefined#/properties/puntos")

### puntos Type

`integer`

## puntosRestantes



`puntosRestantes`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-puntosrestantes.md "undefined#/properties/puntosRestantes")

### puntosRestantes Type

`integer`

## referenciaFacturaId



`referenciaFacturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-referenciafacturaid.md "undefined#/properties/referenciaFacturaId")

### referenciaFacturaId Type

`integer`

## saldoPost



`saldoPost`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-saldopost.md "undefined#/properties/saldoPost")

### saldoPost Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"acumulacion"` |             |
| `"canje"`       |             |
| `"ajuste"`      |             |
| `"vencimiento"` |             |
| `"reverso"`     |             |

## userId



`userId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`

## venceEn



`venceEn`

* is required

* Type: `string`

* cannot be null

* defined in: [MovimientoPuntos](movimientopuntos-properties-venceen.md "undefined#/properties/venceEn")

### venceEn Type

`string`

### venceEn Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
