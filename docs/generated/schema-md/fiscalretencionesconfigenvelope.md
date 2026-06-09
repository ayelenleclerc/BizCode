# FiscalRetencionesConfigEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalRetencionesConfigEnvelope.schema.json](../schema-json/FiscalRetencionesConfigEnvelope.schema.json "open original schema") |

## FiscalRetencionesConfigEnvelope Type

`object` ([FiscalRetencionesConfigEnvelope](fiscalretencionesconfigenvelope.md))

# FiscalRetencionesConfigEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FiscalRetencionesConfigEnvelope](fiscalretencionesconfig.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [FiscalRetencionesConfigEnvelope](fiscalretencionesconfigenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FiscalRetencionesConfig](fiscalretencionesconfig.md))

* cannot be null

* defined in: [FiscalRetencionesConfigEnvelope](fiscalretencionesconfig.md "undefined#/properties/data")

### data Type

`object` ([FiscalRetencionesConfig](fiscalretencionesconfig.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalRetencionesConfigEnvelope](fiscalretencionesconfigenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
