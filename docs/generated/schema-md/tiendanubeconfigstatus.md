# TiendanubeConfigStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TiendanubeConfigStatusEnvelope.schema.json\*](../schema-json/TiendanubeConfigStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([TiendanubeConfigStatus](tiendanubeconfigstatus.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [accessTokenLast4](#accesstokenlast4) | `string`  | Optional | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-accesstokenlast4.md "undefined#/properties/accessTokenLast4") |
| [activo](#activo)                     | `boolean` | Optional | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-activo.md "undefined#/properties/activo")                     |
| [conectadoAt](#conectadoat)           | `string`  | Optional | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-conectadoat.md "undefined#/properties/conectadoAt")           |
| [connected](#connected)               | `boolean` | Required | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-connected.md "undefined#/properties/connected")               |
| [storeId](#storeid)                   | `string`  | Optional | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-storeid.md "undefined#/properties/storeId")                   |
| [storeName](#storename)               | `string`  | Optional | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-storename.md "undefined#/properties/storeName")               |
| [storeUrl](#storeurl)                 | `string`  | Optional | cannot be null | [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-storeurl.md "undefined#/properties/storeUrl")                 |

## accessTokenLast4



`accessTokenLast4`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-accesstokenlast4.md "undefined#/properties/accessTokenLast4")

### accessTokenLast4 Type

`string`

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## conectadoAt



`conectadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-conectadoat.md "undefined#/properties/conectadoAt")

### conectadoAt Type

`string`

### conectadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## connected



`connected`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-connected.md "undefined#/properties/connected")

### connected Type

`boolean`

## storeId



`storeId`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-storeid.md "undefined#/properties/storeId")

### storeId Type

`string`

## storeName



`storeName`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-storename.md "undefined#/properties/storeName")

### storeName Type

`string`

## storeUrl



`storeUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeConfigStatus](tiendanubeconfigstatus-properties-storeurl.md "undefined#/properties/storeUrl")

### storeUrl Type

`string`
