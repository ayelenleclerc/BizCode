# Untitled object in MetricsSnapshot Schema

```txt
undefined#/properties/totals
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MetricsSnapshot.schema.json\*](../schema-json/MetricsSnapshot.schema.json "open original schema") |

## totals Type

`object` ([Details](metricssnapshot-properties-totals.md))

# totals Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                                                       |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [averageDurationMs](#averagedurationms) | `number`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-totals-properties-averagedurationms.md "undefined#/properties/totals/properties/averageDurationMs") |
| [errors4xx](#errors4xx)                 | `integer` | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-totals-properties-errors4xx.md "undefined#/properties/totals/properties/errors4xx")                 |
| [errors5xx](#errors5xx)                 | `integer` | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-totals-properties-errors5xx.md "undefined#/properties/totals/properties/errors5xx")                 |
| [requests](#requests)                   | `integer` | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-totals-properties-requests.md "undefined#/properties/totals/properties/requests")                   |

## averageDurationMs



`averageDurationMs`

* is required

* Type: `number`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-totals-properties-averagedurationms.md "undefined#/properties/totals/properties/averageDurationMs")

### averageDurationMs Type

`number`

### averageDurationMs Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## errors4xx



`errors4xx`

* is required

* Type: `integer`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-totals-properties-errors4xx.md "undefined#/properties/totals/properties/errors4xx")

### errors4xx Type

`integer`

### errors4xx Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## errors5xx



`errors5xx`

* is required

* Type: `integer`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-totals-properties-errors5xx.md "undefined#/properties/totals/properties/errors5xx")

### errors5xx Type

`integer`

### errors5xx Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## requests



`requests`

* is required

* Type: `integer`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-totals-properties-requests.md "undefined#/properties/totals/properties/requests")

### requests Type

`integer`

### requests Constraints

**minimum**: the value of this number must greater than or equal to: `0`
