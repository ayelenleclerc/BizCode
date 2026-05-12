# DashboardSummary Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DashboardSummaryEnvelope.schema.json\*](../schema-json/DashboardSummaryEnvelope.schema.json "open original schema") |

## data Type

`object` ([DashboardSummary](dashboardsummary.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [alertasActivas](#alertasactivas)     | `integer` | Required | cannot be null | [DashboardSummary](dashboardsummary-properties-alertasactivas.md "undefined#/properties/alertasActivas")     |
| [cobrosHoy](#cobroshoy)               | `object`  | Required | cannot be null | [DashboardSummary](dashboardsummary-properties-cobroshoy.md "undefined#/properties/cobrosHoy")               |
| [facturasVencidas](#facturasvencidas) | `object`  | Required | cannot be null | [DashboardSummary](dashboardsummary-properties-facturasvencidas.md "undefined#/properties/facturasVencidas") |
| [ventasHoy](#ventashoy)               | `object`  | Required | cannot be null | [DashboardSummary](dashboardsummary-properties-ventashoy.md "undefined#/properties/ventasHoy")               |

## alertasActivas



`alertasActivas`

* is required

* Type: `integer`

* cannot be null

* defined in: [DashboardSummary](dashboardsummary-properties-alertasactivas.md "undefined#/properties/alertasActivas")

### alertasActivas Type

`integer`

## cobrosHoy



`cobrosHoy`

* is required

* Type: `object` ([Details](dashboardsummary-properties-cobroshoy.md))

* cannot be null

* defined in: [DashboardSummary](dashboardsummary-properties-cobroshoy.md "undefined#/properties/cobrosHoy")

### cobrosHoy Type

`object` ([Details](dashboardsummary-properties-cobroshoy.md))

## facturasVencidas



`facturasVencidas`

* is required

* Type: `object` ([Details](dashboardsummary-properties-facturasvencidas.md))

* cannot be null

* defined in: [DashboardSummary](dashboardsummary-properties-facturasvencidas.md "undefined#/properties/facturasVencidas")

### facturasVencidas Type

`object` ([Details](dashboardsummary-properties-facturasvencidas.md))

## ventasHoy



`ventasHoy`

* is required

* Type: `object` ([Details](dashboardsummary-properties-ventashoy.md))

* cannot be null

* defined in: [DashboardSummary](dashboardsummary-properties-ventashoy.md "undefined#/properties/ventasHoy")

### ventasHoy Type

`object` ([Details](dashboardsummary-properties-ventashoy.md))
