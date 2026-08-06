# FiscalProviderCapabilitiesListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalProviderCapabilitiesListEnvelope.schema.json](../schema-json/FiscalProviderCapabilitiesListEnvelope.schema.json "open original schema") |

## FiscalProviderCapabilitiesListEnvelope Type

`object` ([FiscalProviderCapabilitiesListEnvelope](fiscalprovidercapabilitieslistenvelope.md))

# FiscalProviderCapabilitiesListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [FiscalProviderCapabilitiesListEnvelope](fiscalprovidercapabilitieslistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FiscalProviderCapabilitiesListEnvelope](fiscalprovidercapabilitieslistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([FiscalProviderCapabilities](fiscalprovidercapabilities.md))

* cannot be null

* defined in: [FiscalProviderCapabilitiesListEnvelope](fiscalprovidercapabilitieslistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([FiscalProviderCapabilities](fiscalprovidercapabilities.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilitiesListEnvelope](fiscalprovidercapabilitieslistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
