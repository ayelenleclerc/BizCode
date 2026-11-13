# AnomaliaDetectadaListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AnomaliaDetectadaListEnvelope.schema.json](../schema-json/AnomaliaDetectadaListEnvelope.schema.json "open original schema") |

## AnomaliaDetectadaListEnvelope Type

`object` ([AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope.md))

# AnomaliaDetectadaListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-data.md "undefined#/properties/data")       |
| [limit](#limit)     | `integer` | Required | cannot be null | [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-limit.md "undefined#/properties/limit")     |
| [offset](#offset)   | `integer` | Required | cannot be null | [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-offset.md "undefined#/properties/offset")   |
| [success](#success) | `boolean` | Required | cannot be null | [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-success.md "undefined#/properties/success") |
| [total](#total)     | `integer` | Required | cannot be null | [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-total.md "undefined#/properties/total")     |

## data



`data`

* is required

* Type: `object[]` ([AnomaliaDetectada](anomaliadetectada.md))

* cannot be null

* defined in: [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([AnomaliaDetectada](anomaliadetectada.md))

## limit



`limit`

* is required

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-limit.md "undefined#/properties/limit")

### limit Type

`integer`

## offset



`offset`

* is required

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-offset.md "undefined#/properties/offset")

### offset Type

`integer`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectadaListEnvelope](anomaliadetectadalistenvelope-properties-total.md "undefined#/properties/total")

### total Type

`integer`
