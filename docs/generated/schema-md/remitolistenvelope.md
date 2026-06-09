# RemitoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RemitoListEnvelope.schema.json](../schema-json/RemitoListEnvelope.schema.json "open original schema") |

## RemitoListEnvelope Type

`object` ([RemitoListEnvelope](remitolistenvelope.md))

# RemitoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RemitoListEnvelope](remitolistenvelope-properties-data.md "undefined#/properties/data")       |
| [limit](#limit)     | `integer` | Required | cannot be null | [RemitoListEnvelope](remitolistenvelope-properties-limit.md "undefined#/properties/limit")     |
| [offset](#offset)   | `integer` | Required | cannot be null | [RemitoListEnvelope](remitolistenvelope-properties-offset.md "undefined#/properties/offset")   |
| [success](#success) | `boolean` | Required | cannot be null | [RemitoListEnvelope](remitolistenvelope-properties-success.md "undefined#/properties/success") |
| [total](#total)     | `integer` | Required | cannot be null | [RemitoListEnvelope](remitolistenvelope-properties-total.md "undefined#/properties/total")     |

## data



`data`

* is required

* Type: `object[]` ([Remito](remito.md))

* cannot be null

* defined in: [RemitoListEnvelope](remitolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Remito](remito.md))

## limit



`limit`

* is required

* Type: `integer`

* cannot be null

* defined in: [RemitoListEnvelope](remitolistenvelope-properties-limit.md "undefined#/properties/limit")

### limit Type

`integer`

## offset



`offset`

* is required

* Type: `integer`

* cannot be null

* defined in: [RemitoListEnvelope](remitolistenvelope-properties-offset.md "undefined#/properties/offset")

### offset Type

`integer`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RemitoListEnvelope](remitolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [RemitoListEnvelope](remitolistenvelope-properties-total.md "undefined#/properties/total")

### total Type

`integer`
