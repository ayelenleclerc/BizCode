# ReplenishmentForecastListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReplenishmentForecastListEnvelope.schema.json](../schema-json/ReplenishmentForecastListEnvelope.schema.json "open original schema") |

## ReplenishmentForecastListEnvelope Type

`object` ([ReplenishmentForecastListEnvelope](replenishmentforecastlistenvelope.md))

# ReplenishmentForecastListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ReplenishmentForecastListEnvelope](replenishmentforecastlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ReplenishmentForecastListEnvelope](replenishmentforecastlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ReplenishmentForecast](replenishmentforecast.md))

* cannot be null

* defined in: [ReplenishmentForecastListEnvelope](replenishmentforecastlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ReplenishmentForecast](replenishmentforecast.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ReplenishmentForecastListEnvelope](replenishmentforecastlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
