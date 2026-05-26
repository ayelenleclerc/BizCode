# FacturaVoidEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaVoidEnvelope.schema.json](../schema-json/FacturaVoidEnvelope.schema.json "open original schema") |

## FacturaVoidEnvelope Type

`object` ([FacturaVoidEnvelope](facturavoidenvelope.md))

# FacturaVoidEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FacturaVoidEnvelope](facturavoidresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [FacturaVoidEnvelope](facturavoidenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FacturaVoidResult](facturavoidresult.md))

* cannot be null

* defined in: [FacturaVoidEnvelope](facturavoidresult.md "undefined#/properties/data")

### data Type

`object` ([FacturaVoidResult](facturavoidresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaVoidEnvelope](facturavoidenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
