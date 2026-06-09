# MetricsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MetricsEnvelope.schema.json](../schema-json/MetricsEnvelope.schema.json "open original schema") |

## MetricsEnvelope Type

`object` ([MetricsEnvelope](metricsenvelope.md))

# MetricsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MetricsEnvelope](metricssnapshot.md "undefined#/properties/data")                       |
| [success](#success) | `boolean` | Required | cannot be null | [MetricsEnvelope](metricsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MetricsSnapshot](metricssnapshot.md))

* cannot be null

* defined in: [MetricsEnvelope](metricssnapshot.md "undefined#/properties/data")

### data Type

`object` ([MetricsSnapshot](metricssnapshot.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MetricsEnvelope](metricsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
