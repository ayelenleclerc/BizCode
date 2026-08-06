# FiscalProviderCapabilities Schema

```txt
undefined#/properties/capabilities
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalProviderStatusEntry.schema.json\*](../schema-json/FiscalProviderStatusEntry.schema.json "open original schema") |

## capabilities Type

`object` ([FiscalProviderCapabilities](fiscalprovidercapabilities.md))

# capabilities Properties

| Property                                                      | Type      | Required | Nullable       | Defined by                                                                                                                                               |
| :------------------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [countryCode](#countrycode)                                   | `string`  | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-countrycode.md "undefined#/properties/countryCode")                                   |
| [displayName](#displayname)                                   | `string`  | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-displayname.md "undefined#/properties/displayName")                                   |
| [implemented](#implemented)                                   | `boolean` | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-implemented.md "undefined#/properties/implemented")                                   |
| [notes](#notes)                                               | `string`  | Optional | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-notes.md "undefined#/properties/notes")                                               |
| [provider](#provider)                                         | `string`  | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercode.md "undefined#/properties/provider")                                                                     |
| [supportsCancel](#supportscancel)                             | `boolean` | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportscancel.md "undefined#/properties/supportsCancel")                             |
| [supportsCreditNote](#supportscreditnote)                     | `boolean` | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportscreditnote.md "undefined#/properties/supportsCreditNote")                     |
| [supportsHealthCheck](#supportshealthcheck)                   | `boolean` | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportshealthcheck.md "undefined#/properties/supportsHealthCheck")                   |
| [supportsInvoice](#supportsinvoice)                           | `boolean` | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportsinvoice.md "undefined#/properties/supportsInvoice")                           |
| [supportsLastAuthorizedNumber](#supportslastauthorizednumber) | `boolean` | Required | cannot be null | [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportslastauthorizednumber.md "undefined#/properties/supportsLastAuthorizedNumber") |

## countryCode



`countryCode`

* is required

* Type: `string`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-countrycode.md "undefined#/properties/countryCode")

### countryCode Type

`string`

## displayName



`displayName`

* is required

* Type: `string`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-displayname.md "undefined#/properties/displayName")

### displayName Type

`string`

## implemented



`implemented`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-implemented.md "undefined#/properties/implemented")

### implemented Type

`boolean`

## notes



`notes`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-notes.md "undefined#/properties/notes")

### notes Type

`string`

## provider



`provider`

* is required

* Type: `string` ([FiscalProviderCode](fiscalprovidercode.md))

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([FiscalProviderCode](fiscalprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"arca_wsfe"`      |             |
| `"uruguay_dgi"`    |             |
| `"mexico_sat_pac"` |             |

## supportsCancel



`supportsCancel`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportscancel.md "undefined#/properties/supportsCancel")

### supportsCancel Type

`boolean`

## supportsCreditNote



`supportsCreditNote`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportscreditnote.md "undefined#/properties/supportsCreditNote")

### supportsCreditNote Type

`boolean`

## supportsHealthCheck



`supportsHealthCheck`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportshealthcheck.md "undefined#/properties/supportsHealthCheck")

### supportsHealthCheck Type

`boolean`

## supportsInvoice



`supportsInvoice`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportsinvoice.md "undefined#/properties/supportsInvoice")

### supportsInvoice Type

`boolean`

## supportsLastAuthorizedNumber



`supportsLastAuthorizedNumber`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalProviderCapabilities](fiscalprovidercapabilities-properties-supportslastauthorizednumber.md "undefined#/properties/supportsLastAuthorizedNumber")

### supportsLastAuthorizedNumber Type

`boolean`
