# ReporteCobranzasRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReporteCobranzasRow.schema.json](../schema-json/ReporteCobranzasRow.schema.json "open original schema") |

## ReporteCobranzasRow Type

`object` ([ReporteCobranzasRow](reportecobranzasrow.md))

# ReporteCobranzasRow Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                 |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [count](#count)               | `integer` | Required | cannot be null | [ReporteCobranzasRow](reportecobranzasrow-properties-count.md "undefined#/properties/count")               |
| [fecha](#fecha)               | `string`  | Required | cannot be null | [ReporteCobranzasRow](reportecobranzasrow-properties-fecha.md "undefined#/properties/fecha")               |
| [porFormaPago](#porformapago) | `array`   | Required | cannot be null | [ReporteCobranzasRow](reportecobranzasrow-properties-porformapago.md "undefined#/properties/porFormaPago") |
| [total](#total)               | `string`  | Required | cannot be null | [ReporteCobranzasRow](reportecobranzasrow-properties-total.md "undefined#/properties/total")               |

## count



`count`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReporteCobranzasRow](reportecobranzasrow-properties-count.md "undefined#/properties/count")

### count Type

`integer`

### count Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## fecha

Calendar day YYYY-MM-DD (server local)

`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteCobranzasRow](reportecobranzasrow-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## porFormaPago



`porFormaPago`

* is required

* Type: `object[]` ([CobranzasPorFormaPago](cobranzasporformapago.md))

* cannot be null

* defined in: [ReporteCobranzasRow](reportecobranzasrow-properties-porformapago.md "undefined#/properties/porFormaPago")

### porFormaPago Type

`object[]` ([CobranzasPorFormaPago](cobranzasporformapago.md))

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteCobranzasRow](reportecobranzasrow-properties-total.md "undefined#/properties/total")

### total Type

`string`
