# FeriadoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FeriadoListEnvelope.schema.json](../schema-json/FeriadoListEnvelope.schema.json "open original schema") |

## FeriadoListEnvelope Type

`object` ([FeriadoListEnvelope](feriadolistenvelope.md))

# FeriadoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [FeriadoListEnvelope](feriadolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FeriadoListEnvelope](feriadolistenvelope-properties-success.md "undefined#/properties/success") |
| [total](#total)     | `integer` | Required | cannot be null | [FeriadoListEnvelope](feriadolistenvelope-properties-total.md "undefined#/properties/total")     |

## data



`data`

* is required

* Type: `object[]` ([Feriado](feriado.md))

* cannot be null

* defined in: [FeriadoListEnvelope](feriadolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Feriado](feriado.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FeriadoListEnvelope](feriadolistenvelope-properties-success.md "undefined#/properties/success")

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

* defined in: [FeriadoListEnvelope](feriadolistenvelope-properties-total.md "undefined#/properties/total")

### total Type

`integer`
