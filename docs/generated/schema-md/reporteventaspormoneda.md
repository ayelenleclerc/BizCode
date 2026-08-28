# ReporteVentasPorMoneda Schema

```txt
undefined
```

Sales breakdown by operation currency (#206).

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReporteVentasPorMoneda.schema.json](../schema-json/ReporteVentasPorMoneda.schema.json "open original schema") |

## ReporteVentasPorMoneda Type

`object` ([ReporteVentasPorMoneda](reporteventaspormoneda.md))

# ReporteVentasPorMoneda Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [count](#count)           | `integer` | Required | cannot be null | [ReporteVentasPorMoneda](reporteventaspormoneda-properties-count.md "undefined#/properties/count")           |
| [moneda](#moneda)         | `string`  | Required | cannot be null | [ReporteVentasPorMoneda](reporteventaspormoneda-properties-moneda.md "undefined#/properties/moneda")         |
| [total](#total)           | `string`  | Required | cannot be null | [ReporteVentasPorMoneda](reporteventaspormoneda-properties-total.md "undefined#/properties/total")           |
| [totalLocal](#totallocal) | `string`  | Required | cannot be null | [ReporteVentasPorMoneda](reporteventaspormoneda-properties-totallocal.md "undefined#/properties/totalLocal") |

## count



`count`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReporteVentasPorMoneda](reporteventaspormoneda-properties-count.md "undefined#/properties/count")

### count Type

`integer`

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasPorMoneda](reporteventaspormoneda-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**maximum length**: the maximum number of characters for this string is: `3`

**minimum length**: the minimum number of characters for this string is: `3`

## total

Amount in the original currency.

`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasPorMoneda](reporteventaspormoneda-properties-total.md "undefined#/properties/total")

### total Type

`string`

## totalLocal

Equivalent in local currency.

`totalLocal`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasPorMoneda](reporteventaspormoneda-properties-totallocal.md "undefined#/properties/totalLocal")

### totalLocal Type

`string`
