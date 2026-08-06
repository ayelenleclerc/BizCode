# FiscalProviderValidateEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalProviderValidateEnvelope.schema.json](../schema-json/FiscalProviderValidateEnvelope.schema.json "open original schema") |

## FiscalProviderValidateEnvelope Type

`object` ([FiscalProviderValidateEnvelope](fiscalprovidervalidateenvelope.md))

# FiscalProviderValidateEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FiscalProviderValidateEnvelope](fiscalprovidervalidateenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FiscalProviderValidateEnvelope](fiscalprovidervalidateenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](fiscalprovidervalidateenvelope-properties-data.md))

* cannot be null

* defined in: [FiscalProviderValidateEnvelope](fiscalprovidervalidateenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](fiscalprovidervalidateenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderValidateEnvelope](fiscalprovidervalidateenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
