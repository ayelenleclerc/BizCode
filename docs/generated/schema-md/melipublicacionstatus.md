# MeliPublicacionStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliPublicacionStatusEnvelope.schema.json\*](../schema-json/MeliPublicacionStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([MeliPublicacionStatus](melipublicacionstatus.md))

# data Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [atributos](#atributos)           | `array`   | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-atributos.md "undefined#/properties/atributos")           |
| [estado](#estado)                 | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-estado.md "undefined#/properties/estado")                 |
| [hasPhotos](#hasphotos)           | `boolean` | Required | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-hasphotos.md "undefined#/properties/hasPhotos")           |
| [linked](#linked)                 | `boolean` | Required | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-linked.md "undefined#/properties/linked")                 |
| [meliCategoryId](#melicategoryid) | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-melicategoryid.md "undefined#/properties/meliCategoryId") |
| [meliItemId](#meliitemid)         | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-meliitemid.md "undefined#/properties/meliItemId")         |
| [permalink](#permalink)           | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-permalink.md "undefined#/properties/permalink")           |
| [photoWarning](#photowarning)     | `boolean` | Required | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-photowarning.md "undefined#/properties/photoWarning")     |
| [syncError](#syncerror)           | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-syncerror.md "undefined#/properties/syncError")           |
| [syncStatus](#syncstatus)         | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-syncstatus.md "undefined#/properties/syncStatus")         |
| [ultimaSyncAt](#ultimasyncat)     | `string`  | Optional | cannot be null | [MeliPublicacionStatus](melipublicacionstatus-properties-ultimasyncat.md "undefined#/properties/ultimaSyncAt")     |

## atributos



`atributos`

* is optional

* Type: `object[]` ([MeliAttributeInput](meliattributeinput.md))

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-atributos.md "undefined#/properties/atributos")

### atributos Type

`object[]` ([MeliAttributeInput](meliattributeinput.md))

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## hasPhotos



`hasPhotos`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-hasphotos.md "undefined#/properties/hasPhotos")

### hasPhotos Type

`boolean`

## linked



`linked`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-linked.md "undefined#/properties/linked")

### linked Type

`boolean`

## meliCategoryId



`meliCategoryId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-melicategoryid.md "undefined#/properties/meliCategoryId")

### meliCategoryId Type

`string`

## meliItemId



`meliItemId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-meliitemid.md "undefined#/properties/meliItemId")

### meliItemId Type

`string`

## permalink



`permalink`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-permalink.md "undefined#/properties/permalink")

### permalink Type

`string`

## photoWarning



`photoWarning`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-photowarning.md "undefined#/properties/photoWarning")

### photoWarning Type

`boolean`

## syncError



`syncError`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-syncerror.md "undefined#/properties/syncError")

### syncError Type

`string`

## syncStatus



`syncStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-syncstatus.md "undefined#/properties/syncStatus")

### syncStatus Type

`string`

## ultimaSyncAt



`ultimaSyncAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliPublicacionStatus](melipublicacionstatus-properties-ultimasyncat.md "undefined#/properties/ultimaSyncAt")

### ultimaSyncAt Type

`string`

### ultimaSyncAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
