# ConciliacionMovimientoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConciliacionMovimientoEnvelope.schema.json](../schema-json/ConciliacionMovimientoEnvelope.schema.json "open original schema") |

## ConciliacionMovimientoEnvelope Type

`object` ([ConciliacionMovimientoEnvelope](conciliacionmovimientoenvelope.md))

# ConciliacionMovimientoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ConciliacionMovimientoEnvelope](conciliacionmovimiento.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ConciliacionMovimientoEnvelope](conciliacionmovimientoenvelope-properties-success.md "undefined#/properties/success") |

## data

Reconciliation view of a bank movement (#191). This is a narrower projection than `MovimientoBancario` — it omits `saldo`, `formatoOrigen`, `dedupeKey`, and `createdAt`, and adds `periodoLocked`.

`data`

* is required

* Type: `object` ([ConciliacionMovimiento](conciliacionmovimiento.md))

* cannot be null

* defined in: [ConciliacionMovimientoEnvelope](conciliacionmovimiento.md "undefined#/properties/data")

### data Type

`object` ([ConciliacionMovimiento](conciliacionmovimiento.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConciliacionMovimientoEnvelope](conciliacionmovimientoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`
