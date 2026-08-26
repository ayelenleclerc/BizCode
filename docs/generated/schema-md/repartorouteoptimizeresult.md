# RepartoRouteOptimizeResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoRouteOptimizeResult.schema.json](../schema-json/RepartoRouteOptimizeResult.schema.json "open original schema") |

## RepartoRouteOptimizeResult Type

`object` ([RepartoRouteOptimizeResult](repartorouteoptimizeresult.md))

# RepartoRouteOptimizeResult Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                               |
| :-------------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [applied](#applied)                           | `boolean` | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-applied.md "undefined#/properties/applied")                           |
| [distanceAfterKm](#distanceafterkm)           | `number`  | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-distanceafterkm.md "undefined#/properties/distanceAfterKm")           |
| [distanceBeforeKm](#distancebeforekm)         | `number`  | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-distancebeforekm.md "undefined#/properties/distanceBeforeKm")         |
| [improvementPercent](#improvementpercent)     | `number`  | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-improvementpercent.md "undefined#/properties/improvementPercent")     |
| [orderedItemIds](#ordereditemids)             | `array`   | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-ordereditemids.md "undefined#/properties/orderedItemIds")             |
| [reparto](#reparto)                           | Merged    | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-reparto.md "undefined#/properties/reparto")                           |
| [skippedWithoutCoords](#skippedwithoutcoords) | `integer` | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-skippedwithoutcoords.md "undefined#/properties/skippedWithoutCoords") |
| [stops](#stops)                               | `array`   | Required | cannot be null | [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-stops.md "undefined#/properties/stops")                               |

## applied



`applied`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-applied.md "undefined#/properties/applied")

### applied Type

`boolean`

## distanceAfterKm



`distanceAfterKm`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-distanceafterkm.md "undefined#/properties/distanceAfterKm")

### distanceAfterKm Type

`number`

### distanceAfterKm Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## distanceBeforeKm



`distanceBeforeKm`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-distancebeforekm.md "undefined#/properties/distanceBeforeKm")

### distanceBeforeKm Type

`number`

### distanceBeforeKm Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## improvementPercent

Percent improvement vs current geocoded order ((before-after)/before\*100).

`improvementPercent`

* is required

* Type: `number`

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-improvementpercent.md "undefined#/properties/improvementPercent")

### improvementPercent Type

`number`

## orderedItemIds

Full new item id order (geocoded optimized first, then stops without coords).

`orderedItemIds`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-ordereditemids.md "undefined#/properties/orderedItemIds")

### orderedItemIds Type

`integer[]`

## reparto

Updated reparto when applied; null on preview.

`reparto`

* is required

* Type: merged type ([Details](repartorouteoptimizeresult-properties-reparto.md))

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-reparto.md "undefined#/properties/reparto")

### reparto Type

merged type ([Details](repartorouteoptimizeresult-properties-reparto.md))

one (and only one) of

* [Untitled null in RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-reparto-oneof-0.md "check type definition")

* [Reparto](reparto.md "check type definition")

## skippedWithoutCoords



`skippedWithoutCoords`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-skippedwithoutcoords.md "undefined#/properties/skippedWithoutCoords")

### skippedWithoutCoords Type

`integer`

### skippedWithoutCoords Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## stops

Geocoded stops in suggested order (for Leaflet polyline).

`stops`

* is required

* Type: `object[]` ([RepartoRouteOptimizeStop](repartorouteoptimizestop.md))

* cannot be null

* defined in: [RepartoRouteOptimizeResult](repartorouteoptimizeresult-properties-stops.md "undefined#/properties/stops")

### stops Type

`object[]` ([RepartoRouteOptimizeStop](repartorouteoptimizestop.md))
