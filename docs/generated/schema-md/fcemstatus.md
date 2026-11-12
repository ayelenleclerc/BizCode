# FcemStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FcemStatusEnvelope.schema.json\*](../schema-json/FcemStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([FcemStatus](fcemstatus.md))

# data Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [cae](#cae)                             | `string`  | Required | cannot be null | [FcemStatus](fcemstatus-properties-cae.md "undefined#/properties/cae")                             |
| [caeVto](#caevto)                       | `string`  | Required | cannot be null | [FcemStatus](fcemstatus-properties-caevto.md "undefined#/properties/caeVto")                       |
| [detection](#detection)                 | `object`  | Required | cannot be null | [FcemStatus](fcemdetection.md "undefined#/properties/detection")                                   |
| [facturaId](#facturaid)                 | `integer` | Required | cannot be null | [FcemStatus](fcemstatus-properties-facturaid.md "undefined#/properties/facturaId")                 |
| [fcemEmittedAt](#fcememittedat)         | `string`  | Required | cannot be null | [FcemStatus](fcemstatus-properties-fcememittedat.md "undefined#/properties/fcemEmittedAt")         |
| [fcemEstado](#fcemestado)               | Merged    | Required | cannot be null | [FcemStatus](fcemestado.md "undefined#/properties/fcemEstado")                                     |
| [fcemPlazoPagoDias](#fcemplazopagodias) | `integer` | Required | cannot be null | [FcemStatus](fcemstatus-properties-fcemplazopagodias.md "undefined#/properties/fcemPlazoPagoDias") |
| [fcemRejectReason](#fcemrejectreason)   | `string`  | Required | cannot be null | [FcemStatus](fcemstatus-properties-fcemrejectreason.md "undefined#/properties/fcemRejectReason")   |
| [fcemResolvedAt](#fcemresolvedat)       | `string`  | Required | cannot be null | [FcemStatus](fcemstatus-properties-fcemresolvedat.md "undefined#/properties/fcemResolvedAt")       |
| [fcemTipoCbte](#fcemtipocbte)           | `integer` | Required | cannot be null | [FcemStatus](fcemstatus-properties-fcemtipocbte.md "undefined#/properties/fcemTipoCbte")           |

## cae



`cae`

* is required

* Type: `string`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-cae.md "undefined#/properties/cae")

### cae Type

`string`

## caeVto



`caeVto`

* is required

* Type: `string`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-caevto.md "undefined#/properties/caeVto")

### caeVto Type

`string`

### caeVto Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## detection



`detection`

* is required

* Type: `object` ([FcemDetection](fcemdetection.md))

* cannot be null

* defined in: [FcemStatus](fcemdetection.md "undefined#/properties/detection")

### detection Type

`object` ([FcemDetection](fcemdetection.md))

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fcemEmittedAt



`fcemEmittedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-fcememittedat.md "undefined#/properties/fcemEmittedAt")

### fcemEmittedAt Type

`string`

### fcemEmittedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fcemEstado



`fcemEstado`

* is required

* Type: merged type ([FcemEstado](fcemestado.md))

* cannot be null

* defined in: [FcemStatus](fcemestado.md "undefined#/properties/fcemEstado")

### fcemEstado Type

merged type ([FcemEstado](fcemestado.md))

any of

* [Untitled null in FcemEstado](fcemestado-anyof-0.md "check type definition")

* [Untitled string in FcemEstado](fcemestado-anyof-1.md "check type definition")

## fcemPlazoPagoDias



`fcemPlazoPagoDias`

* is required

* Type: `integer`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-fcemplazopagodias.md "undefined#/properties/fcemPlazoPagoDias")

### fcemPlazoPagoDias Type

`integer`

## fcemRejectReason



`fcemRejectReason`

* is required

* Type: `string`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-fcemrejectreason.md "undefined#/properties/fcemRejectReason")

### fcemRejectReason Type

`string`

## fcemResolvedAt



`fcemResolvedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-fcemresolvedat.md "undefined#/properties/fcemResolvedAt")

### fcemResolvedAt Type

`string`

### fcemResolvedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fcemTipoCbte



`fcemTipoCbte`

* is required

* Type: `integer`

* cannot be null

* defined in: [FcemStatus](fcemstatus-properties-fcemtipocbte.md "undefined#/properties/fcemTipoCbte")

### fcemTipoCbte Type

`integer`
