# DashboardSummaryEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DashboardSummaryEnvelope.schema.json](../schema-json/DashboardSummaryEnvelope.schema.json "open original schema") |

## DashboardSummaryEnvelope Type

`object` ([DashboardSummaryEnvelope](dashboardsummaryenvelope.md))

# DashboardSummaryEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DashboardSummaryEnvelope](dashboardsummary.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [DashboardSummaryEnvelope](dashboardsummaryenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DashboardSummary](dashboardsummary.md))

* cannot be null

* defined in: [DashboardSummaryEnvelope](dashboardsummary.md "undefined#/properties/data")

### data Type

`object` ([DashboardSummary](dashboardsummary.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DashboardSummaryEnvelope](dashboardsummaryenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
