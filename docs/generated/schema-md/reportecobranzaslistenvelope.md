# ReporteCobranzasListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReporteCobranzasListEnvelope.schema.json](../schema-json/ReporteCobranzasListEnvelope.schema.json "open original schema") |

## ReporteCobranzasListEnvelope Type

`object` ([ReporteCobranzasListEnvelope](reportecobranzaslistenvelope.md))

# ReporteCobranzasListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ReporteCobranzasListEnvelope](reportecobranzaslistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ReporteCobranzasListEnvelope](reportecobranzaslistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ReporteCobranzasRow](reportecobranzasrow.md))

* cannot be null

* defined in: [ReporteCobranzasListEnvelope](reportecobranzaslistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ReporteCobranzasRow](reportecobranzasrow.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ReporteCobranzasListEnvelope](reportecobranzaslistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
