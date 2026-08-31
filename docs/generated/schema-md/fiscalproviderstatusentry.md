# FiscalProviderStatusEntry Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalProviderStatusListEnvelope.schema.json\*](../schema-json/FiscalProviderStatusListEnvelope.schema.json "open original schema") |

## items Type

`object` ([FiscalProviderStatusEntry](fiscalproviderstatusentry.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                     |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [capabilities](#capabilities)         | `object`  | Required | cannot be null | [FiscalProviderStatusEntry](fiscalprovidercapabilities.md "undefined#/properties/capabilities")                                |
| [configured](#configured)             | `boolean` | Required | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-configured.md "undefined#/properties/configured")             |
| [countryCode](#countrycode)           | `string`  | Required | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-countrycode.md "undefined#/properties/countryCode")           |
| [enabled](#enabled)                   | `boolean` | Required | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-enabled.md "undefined#/properties/enabled")                   |
| [environment](#environment)           | `string`  | Optional | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-environment.md "undefined#/properties/environment")           |
| [isDefault](#isdefault)               | `boolean` | Required | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-isdefault.md "undefined#/properties/isDefault")               |
| [lastValidationAt](#lastvalidationat) | `string`  | Optional | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-lastvalidationat.md "undefined#/properties/lastValidationAt") |
| [legalName](#legalname)               | `string`  | Optional | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-legalname.md "undefined#/properties/legalName")               |
| [pointOfSale](#pointofsale)           | `string`  | Optional | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-pointofsale.md "undefined#/properties/pointOfSale")           |
| [provider](#provider)                 | `string`  | Required | cannot be null | [FiscalProviderStatusEntry](fiscalprovidercode.md "undefined#/properties/provider")                                            |
| [taxIdentifier](#taxidentifier)       | `string`  | Optional | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-taxidentifier.md "undefined#/properties/taxIdentifier")       |
| [validationStatus](#validationstatus) | `string`  | Optional | cannot be null | [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-validationstatus.md "undefined#/properties/validationStatus") |

## capabilities



`capabilities`

* is required

* Type: `object` ([FiscalProviderCapabilities](fiscalprovidercapabilities.md))

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalprovidercapabilities.md "undefined#/properties/capabilities")

### capabilities Type

`object` ([FiscalProviderCapabilities](fiscalprovidercapabilities.md))

## configured



`configured`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-configured.md "undefined#/properties/configured")

### configured Type

`boolean`

## countryCode



`countryCode`

* is required

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-countrycode.md "undefined#/properties/countryCode")

### countryCode Type

`string`

## enabled



`enabled`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-enabled.md "undefined#/properties/enabled")

### enabled Type

`boolean`

## environment



`environment`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-environment.md "undefined#/properties/environment")

### environment Type

`string`

### environment Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"homologacion"` |             |
| `"produccion"`   |             |

## isDefault



`isDefault`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-isdefault.md "undefined#/properties/isDefault")

### isDefault Type

`boolean`

## lastValidationAt



`lastValidationAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-lastvalidationat.md "undefined#/properties/lastValidationAt")

### lastValidationAt Type

`string`

### lastValidationAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## legalName



`legalName`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-legalname.md "undefined#/properties/legalName")

### legalName Type

`string`

## pointOfSale



`pointOfSale`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-pointofsale.md "undefined#/properties/pointOfSale")

### pointOfSale Type

`string`

## provider



`provider`

* is required

* Type: `string` ([FiscalProviderCode](fiscalprovidercode.md))

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalprovidercode.md "undefined#/properties/provider")

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

## taxIdentifier



`taxIdentifier`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-taxidentifier.md "undefined#/properties/taxIdentifier")

### taxIdentifier Type

`string`

## validationStatus



`validationStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderStatusEntry](fiscalproviderstatusentry-properties-validationstatus.md "undefined#/properties/validationStatus")

### validationStatus Type

`string`
