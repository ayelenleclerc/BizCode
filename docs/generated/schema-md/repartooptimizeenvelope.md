# RepartoOptimizeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoOptimizeEnvelope.schema.json](../schema-json/RepartoOptimizeEnvelope.schema.json "open original schema") |

## RepartoOptimizeEnvelope Type

`object` ([RepartoOptimizeEnvelope](repartooptimizeenvelope.md))

# RepartoOptimizeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RepartoOptimizeEnvelope](repartorouteoptimizeresult.md "undefined#/properties/data")                    |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoOptimizeEnvelope](repartooptimizeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RepartoRouteOptimizeResult](repartorouteoptimizeresult.md))

* cannot be null

* defined in: [RepartoOptimizeEnvelope](repartorouteoptimizeresult.md "undefined#/properties/data")

### data Type

`object` ([RepartoRouteOptimizeResult](repartorouteoptimizeresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoOptimizeEnvelope](repartooptimizeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
