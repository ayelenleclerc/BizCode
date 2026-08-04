# TiendanubePublicacionStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TiendanubePublicacionStatusEnvelope.schema.json\*](../schema-json/TiendanubePublicacionStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([TiendanubePublicacionStatus](tiendanubepublicacionstatus.md))

# data Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [estado](#estado)             | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-estado.md "undefined#/properties/estado")             |
| [hasPhotos](#hasphotos)       | `boolean` | Required | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-hasphotos.md "undefined#/properties/hasPhotos")       |
| [linked](#linked)             | `boolean` | Required | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-linked.md "undefined#/properties/linked")             |
| [permalink](#permalink)       | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-permalink.md "undefined#/properties/permalink")       |
| [photoWarning](#photowarning) | `boolean` | Required | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-photowarning.md "undefined#/properties/photoWarning") |
| [syncError](#syncerror)       | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-syncerror.md "undefined#/properties/syncError")       |
| [syncStatus](#syncstatus)     | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-syncstatus.md "undefined#/properties/syncStatus")     |
| [tnProductId](#tnproductid)   | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-tnproductid.md "undefined#/properties/tnProductId")   |
| [tnVariantId](#tnvariantid)   | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-tnvariantid.md "undefined#/properties/tnVariantId")   |
| [ultimaSyncAt](#ultimasyncat) | `string`  | Optional | cannot be null | [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-ultimasyncat.md "undefined#/properties/ultimaSyncAt") |

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## hasPhotos



`hasPhotos`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-hasphotos.md "undefined#/properties/hasPhotos")

### hasPhotos Type

`boolean`

## linked



`linked`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-linked.md "undefined#/properties/linked")

### linked Type

`boolean`

## permalink



`permalink`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-permalink.md "undefined#/properties/permalink")

### permalink Type

`string`

## photoWarning



`photoWarning`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-photowarning.md "undefined#/properties/photoWarning")

### photoWarning Type

`boolean`

## syncError



`syncError`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-syncerror.md "undefined#/properties/syncError")

### syncError Type

`string`

## syncStatus



`syncStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-syncstatus.md "undefined#/properties/syncStatus")

### syncStatus Type

`string`

## tnProductId



`tnProductId`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-tnproductid.md "undefined#/properties/tnProductId")

### tnProductId Type

`string`

## tnVariantId



`tnVariantId`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-tnvariantid.md "undefined#/properties/tnVariantId")

### tnVariantId Type

`string`

## ultimaSyncAt



`ultimaSyncAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubePublicacionStatus](tiendanubepublicacionstatus-properties-ultimasyncat.md "undefined#/properties/ultimaSyncAt")

### ultimaSyncAt Type

`string`

### ultimaSyncAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
