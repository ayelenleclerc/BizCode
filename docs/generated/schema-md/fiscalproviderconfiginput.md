# FiscalProviderConfigInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalProviderConfigInput.schema.json](../schema-json/FiscalProviderConfigInput.schema.json "open original schema") |

## FiscalProviderConfigInput Type

`object` ([FiscalProviderConfigInput](fiscalproviderconfiginput.md))

# FiscalProviderConfigInput Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                           |
| :-------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [ambiente](#ambiente)       | `string` | Optional | cannot be null | [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-ambiente.md "undefined#/properties/ambiente")       |
| [certificate](#certificate) | `string` | Optional | cannot be null | [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-certificate.md "undefined#/properties/certificate") |
| [cuit](#cuit)               | `string` | Optional | cannot be null | [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-cuit.md "undefined#/properties/cuit")               |
| [privateKey](#privatekey)   | `string` | Optional | cannot be null | [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-privatekey.md "undefined#/properties/privateKey")   |
| [provider](#provider)       | `string` | Required | cannot be null | [FiscalProviderConfigInput](fiscalprovidercode.md "undefined#/properties/provider")                                  |

## ambiente



`ambiente`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-ambiente.md "undefined#/properties/ambiente")

### ambiente Type

`string`

### ambiente Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"homologacion"` |             |
| `"produccion"`   |             |

## certificate



`certificate`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-certificate.md "undefined#/properties/certificate")

### certificate Type

`string`

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## privateKey



`privateKey`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderConfigInput](fiscalproviderconfiginput-properties-privatekey.md "undefined#/properties/privateKey")

### privateKey Type

`string`

## provider



`provider`

* is required

* Type: `string` ([FiscalProviderCode](fiscalprovidercode.md))

* cannot be null

* defined in: [FiscalProviderConfigInput](fiscalprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([FiscalProviderCode](fiscalprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"arca_wsfe"`      |             |
| `"uruguay_dgi"`    |             |
| `"chile_sii"`      |             |
| `"mexico_sat_pac"` |             |
