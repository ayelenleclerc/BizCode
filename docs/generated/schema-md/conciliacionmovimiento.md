# ConciliacionMovimiento Schema

```txt
undefined#/properties/data
```

Reconciliation view of a bank movement (#191). This is a narrower projection than `MovimientoBancario` — it omits `saldo`, `formatoOrigen`, `dedupeKey`, and `createdAt`, and adds `periodoLocked`.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConciliacionMovimientoEnvelope.schema.json\*](../schema-json/ConciliacionMovimientoEnvelope.schema.json "open original schema") |

## data Type

`object` ([ConciliacionMovimiento](conciliacionmovimiento.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [conciliadoAt](#conciliadoat)         | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-conciliadoat.md "undefined#/properties/conciliadoAt")         |
| [conciliadoId](#conciliadoid)         | `integer` | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-conciliadoid.md "undefined#/properties/conciliadoId")         |
| [conciliadoTipo](#conciliadotipo)     | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-conciliadotipo.md "undefined#/properties/conciliadoTipo")     |
| [cuentaId](#cuentaid)                 | `integer` | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-cuentaid.md "undefined#/properties/cuentaId")                 |
| [descripcion](#descripcion)           | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-descripcion.md "undefined#/properties/descripcion")           |
| [fecha](#fecha)                       | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-fecha.md "undefined#/properties/fecha")                       |
| [id](#id)                             | `integer` | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-id.md "undefined#/properties/id")                             |
| [importe](#importe)                   | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-importe.md "undefined#/properties/importe")                   |
| [matchEstado](#matchestado)           | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-matchestado.md "undefined#/properties/matchEstado")           |
| [matchScore](#matchscore)             | `number`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-matchscore.md "undefined#/properties/matchScore")             |
| [matchSugerencias](#matchsugerencias) | `array`   | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-matchsugerencias.md "undefined#/properties/matchSugerencias") |
| [periodoLocked](#periodolocked)       | `boolean` | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-periodolocked.md "undefined#/properties/periodoLocked")       |
| [referencia](#referencia)             | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-referencia.md "undefined#/properties/referencia")             |
| [tipo](#tipo)                         | `string`  | Required | cannot be null | [ConciliacionMovimiento](conciliacionmovimiento-properties-tipo.md "undefined#/properties/tipo")                         |

## conciliadoAt



`conciliadoAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-conciliadoat.md "undefined#/properties/conciliadoAt")

### conciliadoAt Type

`string`

### conciliadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## conciliadoId



`conciliadoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-conciliadoid.md "undefined#/properties/conciliadoId")

### conciliadoId Type

`integer`

## conciliadoTipo



`conciliadoTipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-conciliadotipo.md "undefined#/properties/conciliadoTipo")

### conciliadoTipo Type

`string`

### conciliadoTipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"recibo_forma"` |             |
| `"cobro"`        |             |
| `null`           |             |

## cuentaId



`cuentaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-cuentaid.md "undefined#/properties/cuentaId")

### cuentaId Type

`integer`

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## importe



`importe`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-importe.md "undefined#/properties/importe")

### importe Type

`string`

## matchEstado



`matchEstado`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-matchestado.md "undefined#/properties/matchEstado")

### matchEstado Type

`string`

### matchEstado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"unmatched"`      |             |
| `"suggested"`      |             |
| `"matched_auto"`   |             |
| `"matched_manual"` |             |
| `"ignored"`        |             |
| `"bank_fee"`       |             |

## matchScore



`matchScore`

* is required

* Type: `number`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-matchscore.md "undefined#/properties/matchScore")

### matchScore Type

`number`

## matchSugerencias



`matchSugerencias`

* is required

* Type: `object[]` ([MatchSugerencia](matchsugerencia.md))

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-matchsugerencias.md "undefined#/properties/matchSugerencias")

### matchSugerencias Type

`object[]` ([MatchSugerencia](matchsugerencia.md))

## periodoLocked

True when the movement's YYYY-MM period is locked for reconciliation (#191).

`periodoLocked`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-periodolocked.md "undefined#/properties/periodoLocked")

### periodoLocked Type

`boolean`

## referencia



`referencia`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliacionMovimiento](conciliacionmovimiento-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"debito"`  |             |
| `"credito"` |             |
