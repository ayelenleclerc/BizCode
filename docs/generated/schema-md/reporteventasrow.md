# ReporteVentasRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReporteVentasRow.schema.json](../schema-json/ReporteVentasRow.schema.json "open original schema") |

## ReporteVentasRow Type

`object` ([ReporteVentasRow](reporteventasrow.md))

# ReporteVentasRow Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [count](#count)     | `integer` | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-count.md "undefined#/properties/count")     |
| [iva1](#iva1)       | `string`  | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-iva1.md "undefined#/properties/iva1")       |
| [iva2](#iva2)       | `string`  | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-iva2.md "undefined#/properties/iva2")       |
| [neto1](#neto1)     | `string`  | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-neto1.md "undefined#/properties/neto1")     |
| [neto2](#neto2)     | `string`  | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-neto2.md "undefined#/properties/neto2")     |
| [periodo](#periodo) | `string`  | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-periodo.md "undefined#/properties/periodo") |
| [total](#total)     | `string`  | Required | cannot be null | [ReporteVentasRow](reporteventasrow-properties-total.md "undefined#/properties/total")     |

## count



`count`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-count.md "undefined#/properties/count")

### count Type

`integer`

### count Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## iva1



`iva1`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-iva1.md "undefined#/properties/iva1")

### iva1 Type

`string`

## iva2



`iva2`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-iva2.md "undefined#/properties/iva2")

### iva2 Type

`string`

## neto1



`neto1`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-neto1.md "undefined#/properties/neto1")

### neto1 Type

`string`

## neto2



`neto2`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-neto2.md "undefined#/properties/neto2")

### neto2 Type

`string`

## periodo

Bucket key (YYYY-MM-DD, YYYY-MM, or week Monday date)

`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ReporteVentasRow](reporteventasrow-properties-total.md "undefined#/properties/total")

### total Type

`string`
