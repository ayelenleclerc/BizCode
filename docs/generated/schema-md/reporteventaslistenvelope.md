# ReporteVentasListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReporteVentasListEnvelope.schema.json](../schema-json/ReporteVentasListEnvelope.schema.json "open original schema") |

## ReporteVentasListEnvelope Type

`object` ([ReporteVentasListEnvelope](reporteventaslistenvelope.md))

# ReporteVentasListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ReporteVentasListEnvelope](reporteventaslistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ReporteVentasListEnvelope](reporteventaslistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ReporteVentasRow](reporteventasrow.md))

* cannot be null

* defined in: [ReporteVentasListEnvelope](reporteventaslistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ReporteVentasRow](reporteventasrow.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ReporteVentasListEnvelope](reporteventaslistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
