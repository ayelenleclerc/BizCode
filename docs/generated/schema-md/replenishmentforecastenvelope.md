# ReplenishmentForecastEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReplenishmentForecastEnvelope.schema.json](../schema-json/ReplenishmentForecastEnvelope.schema.json "open original schema") |

## ReplenishmentForecastEnvelope Type

`object` ([ReplenishmentForecastEnvelope](replenishmentforecastenvelope.md))

# ReplenishmentForecastEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ReplenishmentForecastEnvelope](replenishmentforecast.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ReplenishmentForecastEnvelope](replenishmentforecastenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ReplenishmentForecast](replenishmentforecast.md))

* cannot be null

* defined in: [ReplenishmentForecastEnvelope](replenishmentforecast.md "undefined#/properties/data")

### data Type

`object` ([ReplenishmentForecast](replenishmentforecast.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ReplenishmentForecastEnvelope](replenishmentforecastenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
