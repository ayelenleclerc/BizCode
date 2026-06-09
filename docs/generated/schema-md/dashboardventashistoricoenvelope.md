# DashboardVentasHistoricoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DashboardVentasHistoricoEnvelope.schema.json](../schema-json/DashboardVentasHistoricoEnvelope.schema.json "open original schema") |

## DashboardVentasHistoricoEnvelope Type

`object` ([DashboardVentasHistoricoEnvelope](dashboardventashistoricoenvelope.md))

# DashboardVentasHistoricoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DashboardVentasHistoricoEnvelope](dashboardventashistorico.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [DashboardVentasHistoricoEnvelope](dashboardventashistoricoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DashboardVentasHistorico](dashboardventashistorico.md))

* cannot be null

* defined in: [DashboardVentasHistoricoEnvelope](dashboardventashistorico.md "undefined#/properties/data")

### data Type

`object` ([DashboardVentasHistorico](dashboardventashistorico.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DashboardVentasHistoricoEnvelope](dashboardventashistoricoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
