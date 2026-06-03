# FacturaPrintEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaPrintEnvelope.schema.json](../schema-json/FacturaPrintEnvelope.schema.json "open original schema") |

## FacturaPrintEnvelope Type

`object` ([FacturaPrintEnvelope](facturaprintenvelope.md))

# FacturaPrintEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FacturaPrintEnvelope](facturaprintresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [FacturaPrintEnvelope](facturaprintenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FacturaPrintResult](facturaprintresult.md))

* cannot be null

* defined in: [FacturaPrintEnvelope](facturaprintresult.md "undefined#/properties/data")

### data Type

`object` ([FacturaPrintResult](facturaprintresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaPrintEnvelope](facturaprintenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
