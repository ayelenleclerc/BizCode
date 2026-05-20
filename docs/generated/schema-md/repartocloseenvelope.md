# RepartoCloseEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoCloseEnvelope.schema.json](../schema-json/RepartoCloseEnvelope.schema.json "open original schema") |

## RepartoCloseEnvelope Type

`object` ([RepartoCloseEnvelope](repartocloseenvelope.md))

# RepartoCloseEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RepartoCloseEnvelope](reparto.md "undefined#/properties/data")                                    |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoCloseEnvelope](repartocloseenvelope-properties-success.md "undefined#/properties/success") |
| [summary](#summary) | `object`  | Required | cannot be null | [RepartoCloseEnvelope](repartoclosesummary.md "undefined#/properties/summary")                     |

## data



`data`

* is required

* Type: `object` ([Reparto](reparto.md))

* cannot be null

* defined in: [RepartoCloseEnvelope](reparto.md "undefined#/properties/data")

### data Type

`object` ([Reparto](reparto.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoCloseEnvelope](repartocloseenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## summary



`summary`

* is required

* Type: `object` ([RepartoCloseSummary](repartoclosesummary.md))

* cannot be null

* defined in: [RepartoCloseEnvelope](repartoclosesummary.md "undefined#/properties/summary")

### summary Type

`object` ([RepartoCloseSummary](repartoclosesummary.md))
