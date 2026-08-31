# Untitled object in FiscalDocumentAuthorizeEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalDocumentAuthorizeEnvelope.schema.json\*](../schema-json/FiscalDocumentAuthorizeEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](fiscaldocumentauthorizeenvelope-properties-data.md))

# data Properties

| Property                                          | Type      | Required | Nullable       | Defined by                                                                                                                                                                             |
| :------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [authorizationCode](#authorizationcode)           | `string`  | Optional | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-authorizationcode.md "undefined#/properties/data/properties/authorizationCode")           |
| [authorizationExpiresAt](#authorizationexpiresat) | `string`  | Optional | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-authorizationexpiresat.md "undefined#/properties/data/properties/authorizationExpiresAt") |
| [fiscalDocumentId](#fiscaldocumentid)             | `integer` | Required | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-fiscaldocumentid.md "undefined#/properties/data/properties/fiscalDocumentId")             |
| [provider](#provider)                             | `string`  | Required | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscalprovidercode.md "undefined#/properties/data/properties/provider")                                                                              |
| [status](#status)                                 | `string`  | Required | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")                                 |

## authorizationCode



`authorizationCode`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-authorizationcode.md "undefined#/properties/data/properties/authorizationCode")

### authorizationCode Type

`string`

## authorizationExpiresAt



`authorizationExpiresAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-authorizationexpiresat.md "undefined#/properties/data/properties/authorizationExpiresAt")

### authorizationExpiresAt Type

`string`

### authorizationExpiresAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fiscalDocumentId



`fiscalDocumentId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-fiscaldocumentid.md "undefined#/properties/data/properties/fiscalDocumentId")

### fiscalDocumentId Type

`integer`

## provider



`provider`

* is required

* Type: `string` ([FiscalProviderCode](fiscalprovidercode.md))

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscalprovidercode.md "undefined#/properties/data/properties/provider")

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

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")

### status Type

`string`

### status Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"pending"`    |             |
| `"authorized"` |             |
| `"rejected"`   |             |
| `"failed"`     |             |
