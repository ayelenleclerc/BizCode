# DashboardVentasHistorico Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DashboardVentasHistoricoEnvelope.schema.json\*](../schema-json/DashboardVentasHistoricoEnvelope.schema.json "open original schema") |

## data Type

`object` ([DashboardVentasHistorico](dashboardventashistorico.md))

# data Properties

| Property                    | Type    | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------- | :------ | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [bySeller](#byseller)       | `array` | Required | cannot be null | [DashboardVentasHistorico](dashboardventashistorico-properties-byseller.md "undefined#/properties/bySeller")       |
| [series](#series)           | `array` | Required | cannot be null | [DashboardVentasHistorico](dashboardventashistorico-properties-series.md "undefined#/properties/series")           |
| [topArticles](#toparticles) | `array` | Required | cannot be null | [DashboardVentasHistorico](dashboardventashistorico-properties-toparticles.md "undefined#/properties/topArticles") |

## bySeller



`bySeller`

* is required

* Type: `object[]` ([DashboardVentasBySellerRow](dashboardventasbysellerrow.md))

* cannot be null

* defined in: [DashboardVentasHistorico](dashboardventashistorico-properties-byseller.md "undefined#/properties/bySeller")

### bySeller Type

`object[]` ([DashboardVentasBySellerRow](dashboardventasbysellerrow.md))

## series



`series`

* is required

* Type: `object[]` ([DashboardVentasSeriesRow](dashboardventasseriesrow.md))

* cannot be null

* defined in: [DashboardVentasHistorico](dashboardventashistorico-properties-series.md "undefined#/properties/series")

### series Type

`object[]` ([DashboardVentasSeriesRow](dashboardventasseriesrow.md))

## topArticles



`topArticles`

* is required

* Type: `object[]` ([DashboardTopArticuloRow](dashboardtoparticulorow.md))

* cannot be null

* defined in: [DashboardVentasHistorico](dashboardventashistorico-properties-toparticles.md "undefined#/properties/topArticles")

### topArticles Type

`object[]` ([DashboardTopArticuloRow](dashboardtoparticulorow.md))
