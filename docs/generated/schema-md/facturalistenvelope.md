# FacturaListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaListEnvelope.schema.json](../schema-json/FacturaListEnvelope.schema.json "open original schema") |

## FacturaListEnvelope Type

`object` ([FacturaListEnvelope](facturalistenvelope.md))

# FacturaListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [FacturaListEnvelope](facturalistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FacturaListEnvelope](facturalistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Factura](factura.md))

* cannot be null

* defined in: [FacturaListEnvelope](facturalistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Factura](factura.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaListEnvelope](facturalistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
