# ConciliacionData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConciliacionEnvelope.schema.json\*](../schema-json/ConciliacionEnvelope.schema.json "open original schema") |

## data Type

`object` ([ConciliacionData](conciliaciondata.md))

# data Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                         |
| :-------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [movimientos](#movimientos) | `array`  | Required | cannot be null | [ConciliacionData](conciliaciondata-properties-movimientos.md "undefined#/properties/movimientos") |
| [summary](#summary)         | `object` | Required | cannot be null | [ConciliacionData](conciliacionsummary.md "undefined#/properties/summary")                         |

## movimientos



`movimientos`

* is required

* Type: `object[]` ([ConciliacionMovimiento](conciliacionmovimiento.md))

* cannot be null

* defined in: [ConciliacionData](conciliaciondata-properties-movimientos.md "undefined#/properties/movimientos")

### movimientos Type

`object[]` ([ConciliacionMovimiento](conciliacionmovimiento.md))

## summary



`summary`

* is required

* Type: `object` ([ConciliacionSummary](conciliacionsummary.md))

* cannot be null

* defined in: [ConciliacionData](conciliacionsummary.md "undefined#/properties/summary")

### summary Type

`object` ([ConciliacionSummary](conciliacionsummary.md))
