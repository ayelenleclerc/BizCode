# MetricsSnapshot Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MetricsSnapshot.schema.json](../schema-json/MetricsSnapshot.schema.json "open original schema") |

## MetricsSnapshot Type

`object` ([MetricsSnapshot](metricssnapshot.md))

# MetricsSnapshot Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [appEnv](#appenv)                       | `string`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-appenv.md "undefined#/properties/appEnv")                       |
| [appVersion](#appversion)               | `string`  | Optional | cannot be null | [MetricsSnapshot](metricssnapshot-properties-appversion.md "undefined#/properties/appVersion")               |
| [requestsByMethod](#requestsbymethod)   | `object`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-requestsbymethod.md "undefined#/properties/requestsByMethod")   |
| [requestsByRoute](#requestsbyroute)     | `object`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-requestsbyroute.md "undefined#/properties/requestsByRoute")     |
| [responsesByStatus](#responsesbystatus) | `object`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-responsesbystatus.md "undefined#/properties/responsesByStatus") |
| [startedAt](#startedat)                 | `string`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-startedat.md "undefined#/properties/startedAt")                 |
| [totals](#totals)                       | `object`  | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-totals.md "undefined#/properties/totals")                       |
| [uptimeSeconds](#uptimeseconds)         | `integer` | Required | cannot be null | [MetricsSnapshot](metricssnapshot-properties-uptimeseconds.md "undefined#/properties/uptimeSeconds")         |

## appEnv



`appEnv`

* is required

* Type: `string`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-appenv.md "undefined#/properties/appEnv")

### appEnv Type

`string`

## appVersion



`appVersion`

* is optional

* Type: `string`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-appversion.md "undefined#/properties/appVersion")

### appVersion Type

`string`

## requestsByMethod



`requestsByMethod`

* is required

* Type: `object` ([Details](metricssnapshot-properties-requestsbymethod.md))

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-requestsbymethod.md "undefined#/properties/requestsByMethod")

### requestsByMethod Type

`object` ([Details](metricssnapshot-properties-requestsbymethod.md))

## requestsByRoute



`requestsByRoute`

* is required

* Type: `object` ([Details](metricssnapshot-properties-requestsbyroute.md))

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-requestsbyroute.md "undefined#/properties/requestsByRoute")

### requestsByRoute Type

`object` ([Details](metricssnapshot-properties-requestsbyroute.md))

## responsesByStatus



`responsesByStatus`

* is required

* Type: `object` ([Details](metricssnapshot-properties-responsesbystatus.md))

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-responsesbystatus.md "undefined#/properties/responsesByStatus")

### responsesByStatus Type

`object` ([Details](metricssnapshot-properties-responsesbystatus.md))

## startedAt



`startedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-startedat.md "undefined#/properties/startedAt")

### startedAt Type

`string`

### startedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## totals



`totals`

* is required

* Type: `object` ([Details](metricssnapshot-properties-totals.md))

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-totals.md "undefined#/properties/totals")

### totals Type

`object` ([Details](metricssnapshot-properties-totals.md))

## uptimeSeconds



`uptimeSeconds`

* is required

* Type: `integer`

* cannot be null

* defined in: [MetricsSnapshot](metricssnapshot-properties-uptimeseconds.md "undefined#/properties/uptimeSeconds")

### uptimeSeconds Type

`integer`

### uptimeSeconds Constraints

**minimum**: the value of this number must greater than or equal to: `0`
