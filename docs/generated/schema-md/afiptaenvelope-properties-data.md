# Untitled object in ArcaTaEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaTaEnvelope.schema.json\*](../schema-json/ArcaTaEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](afiptaenvelope-properties-data.md))

# data Properties

| Property                  | Type     | Required | Nullable       | Defined by                                                                                                                   |
| :------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [expiration](#expiration) | `string` | Optional | cannot be null | [ArcaTaEnvelope](afiptaenvelope-properties-data-properties-expiration.md "undefined#/properties/data/properties/expiration") |
| [sign](#sign)             | `string` | Optional | cannot be null | [ArcaTaEnvelope](afiptaenvelope-properties-data-properties-sign.md "undefined#/properties/data/properties/sign")             |
| [token](#token)           | `string` | Optional | cannot be null | [ArcaTaEnvelope](afiptaenvelope-properties-data-properties-token.md "undefined#/properties/data/properties/token")           |

## expiration



`expiration`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaTaEnvelope](afiptaenvelope-properties-data-properties-expiration.md "undefined#/properties/data/properties/expiration")

### expiration Type

`string`

### expiration Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## sign



`sign`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaTaEnvelope](afiptaenvelope-properties-data-properties-sign.md "undefined#/properties/data/properties/sign")

### sign Type

`string`

## token



`token`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaTaEnvelope](afiptaenvelope-properties-data-properties-token.md "undefined#/properties/data/properties/token")

### token Type

`string`
