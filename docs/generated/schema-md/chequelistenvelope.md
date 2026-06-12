# ChequeListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChequeListEnvelope.schema.json](../schema-json/ChequeListEnvelope.schema.json "open original schema") |

## ChequeListEnvelope Type

`object` ([ChequeListEnvelope](chequelistenvelope.md))

# ChequeListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ChequeListEnvelope](chequelistenvelope-properties-data.md "undefined#/properties/data")       |
| [limit](#limit)     | `integer` | Required | cannot be null | [ChequeListEnvelope](chequelistenvelope-properties-limit.md "undefined#/properties/limit")     |
| [offset](#offset)   | `integer` | Required | cannot be null | [ChequeListEnvelope](chequelistenvelope-properties-offset.md "undefined#/properties/offset")   |
| [success](#success) | `boolean` | Required | cannot be null | [ChequeListEnvelope](chequelistenvelope-properties-success.md "undefined#/properties/success") |
| [total](#total)     | `integer` | Required | cannot be null | [ChequeListEnvelope](chequelistenvelope-properties-total.md "undefined#/properties/total")     |

## data



`data`

* is required

* Type: `object[]` ([Cheque](cheque.md))

* cannot be null

* defined in: [ChequeListEnvelope](chequelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Cheque](cheque.md))

## limit



`limit`

* is required

* Type: `integer`

* cannot be null

* defined in: [ChequeListEnvelope](chequelistenvelope-properties-limit.md "undefined#/properties/limit")

### limit Type

`integer`

## offset



`offset`

* is required

* Type: `integer`

* cannot be null

* defined in: [ChequeListEnvelope](chequelistenvelope-properties-offset.md "undefined#/properties/offset")

### offset Type

`integer`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ChequeListEnvelope](chequelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [ChequeListEnvelope](chequelistenvelope-properties-total.md "undefined#/properties/total")

### total Type

`integer`
