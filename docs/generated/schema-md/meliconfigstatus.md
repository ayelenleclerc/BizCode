# MeliConfigStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliConfigStatusEnvelope.schema.json\*](../schema-json/MeliConfigStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([MeliConfigStatus](meliconfigstatus.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [accessTokenLast4](#accesstokenlast4) | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-accesstokenlast4.md "undefined#/properties/accessTokenLast4") |
| [activo](#activo)                     | `boolean` | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-activo.md "undefined#/properties/activo")                     |
| [conectadoAt](#conectadoat)           | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-conectadoat.md "undefined#/properties/conectadoAt")           |
| [connected](#connected)               | `boolean` | Required | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-connected.md "undefined#/properties/connected")               |
| [meliUserId](#meliuserid)             | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-meliuserid.md "undefined#/properties/meliUserId")             |
| [nickname](#nickname)                 | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-nickname.md "undefined#/properties/nickname")                 |
| [sellerId](#sellerid)                 | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-sellerid.md "undefined#/properties/sellerId")                 |
| [sitio](#sitio)                       | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-sitio.md "undefined#/properties/sitio")                       |
| [tokenExpiresAt](#tokenexpiresat)     | `string`  | Optional | cannot be null | [MeliConfigStatus](meliconfigstatus-properties-tokenexpiresat.md "undefined#/properties/tokenExpiresAt")     |

## accessTokenLast4



`accessTokenLast4`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-accesstokenlast4.md "undefined#/properties/accessTokenLast4")

### accessTokenLast4 Type

`string`

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## conectadoAt



`conectadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-conectadoat.md "undefined#/properties/conectadoAt")

### conectadoAt Type

`string`

### conectadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## connected



`connected`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-connected.md "undefined#/properties/connected")

### connected Type

`boolean`

## meliUserId



`meliUserId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-meliuserid.md "undefined#/properties/meliUserId")

### meliUserId Type

`string`

## nickname



`nickname`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-nickname.md "undefined#/properties/nickname")

### nickname Type

`string`

## sellerId



`sellerId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-sellerid.md "undefined#/properties/sellerId")

### sellerId Type

`string`

## sitio



`sitio`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-sitio.md "undefined#/properties/sitio")

### sitio Type

`string`

## tokenExpiresAt



`tokenExpiresAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliConfigStatus](meliconfigstatus-properties-tokenexpiresat.md "undefined#/properties/tokenExpiresAt")

### tokenExpiresAt Type

`string`

### tokenExpiresAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
