# WooCommercePublicacionStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WooCommercePublicacionStatusEnvelope.schema.json\*](../schema-json/WooCommercePublicacionStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([WooCommercePublicacionStatus](woocommercepublicacionstatus.md))

# data Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [estado](#estado)             | `string`  | Optional | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-estado.md "undefined#/properties/estado")             |
| [hasPhotos](#hasphotos)       | `boolean` | Required | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-hasphotos.md "undefined#/properties/hasPhotos")       |
| [linked](#linked)             | `boolean` | Required | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-linked.md "undefined#/properties/linked")             |
| [permalink](#permalink)       | `string`  | Optional | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-permalink.md "undefined#/properties/permalink")       |
| [photoWarning](#photowarning) | `boolean` | Required | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-photowarning.md "undefined#/properties/photoWarning") |
| [syncError](#syncerror)       | `string`  | Optional | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-syncerror.md "undefined#/properties/syncError")       |
| [syncStatus](#syncstatus)     | `string`  | Optional | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-syncstatus.md "undefined#/properties/syncStatus")     |
| [ultimaSyncAt](#ultimasyncat) | `string`  | Optional | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-ultimasyncat.md "undefined#/properties/ultimaSyncAt") |
| [wcProductId](#wcproductid)   | `string`  | Optional | cannot be null | [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-wcproductid.md "undefined#/properties/wcProductId")   |

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## hasPhotos



`hasPhotos`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-hasphotos.md "undefined#/properties/hasPhotos")

### hasPhotos Type

`boolean`

## linked



`linked`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-linked.md "undefined#/properties/linked")

### linked Type

`boolean`

## permalink



`permalink`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-permalink.md "undefined#/properties/permalink")

### permalink Type

`string`

## photoWarning



`photoWarning`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-photowarning.md "undefined#/properties/photoWarning")

### photoWarning Type

`boolean`

## syncError



`syncError`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-syncerror.md "undefined#/properties/syncError")

### syncError Type

`string`

## syncStatus



`syncStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-syncstatus.md "undefined#/properties/syncStatus")

### syncStatus Type

`string`

## ultimaSyncAt



`ultimaSyncAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-ultimasyncat.md "undefined#/properties/ultimaSyncAt")

### ultimaSyncAt Type

`string`

### ultimaSyncAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## wcProductId



`wcProductId`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommercePublicacionStatus](woocommercepublicacionstatus-properties-wcproductid.md "undefined#/properties/wcProductId")

### wcProductId Type

`string`
