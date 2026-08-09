# VisitaDiaKpi Schema

```txt
undefined#/allOf/0/properties/kpi
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VisitaListEnvelope.schema.json\*](../schema-json/VisitaListEnvelope.schema.json "open original schema") |

## kpi Type

`object` ([VisitaDiaKpi](visitadiakpi.md))

# kpi Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [conversionPct](#conversionpct) | `number`  | Required | cannot be null | [VisitaDiaKpi](visitadiakpi-properties-conversionpct.md "undefined#/properties/conversionPct") |
| [pedidos](#pedidos)             | `integer` | Required | cannot be null | [VisitaDiaKpi](visitadiakpi-properties-pedidos.md "undefined#/properties/pedidos")             |
| [planificadas](#planificadas)   | `integer` | Required | cannot be null | [VisitaDiaKpi](visitadiakpi-properties-planificadas.md "undefined#/properties/planificadas")   |
| [visitados](#visitados)         | `integer` | Required | cannot be null | [VisitaDiaKpi](visitadiakpi-properties-visitados.md "undefined#/properties/visitados")         |

## conversionPct



`conversionPct`

* is required

* Type: `number`

* cannot be null

* defined in: [VisitaDiaKpi](visitadiakpi-properties-conversionpct.md "undefined#/properties/conversionPct")

### conversionPct Type

`number`

## pedidos



`pedidos`

* is required

* Type: `integer`

* cannot be null

* defined in: [VisitaDiaKpi](visitadiakpi-properties-pedidos.md "undefined#/properties/pedidos")

### pedidos Type

`integer`

## planificadas



`planificadas`

* is required

* Type: `integer`

* cannot be null

* defined in: [VisitaDiaKpi](visitadiakpi-properties-planificadas.md "undefined#/properties/planificadas")

### planificadas Type

`integer`

## visitados



`visitados`

* is required

* Type: `integer`

* cannot be null

* defined in: [VisitaDiaKpi](visitadiakpi-properties-visitados.md "undefined#/properties/visitados")

### visitados Type

`integer`
