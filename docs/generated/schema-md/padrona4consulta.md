# PadronA4Consulta Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PadronA4Envelope.schema.json\*](../schema-json/PadronA4Envelope.schema.json "open original schema") |

## data Type

`object` ([PadronA4Consulta](padrona4consulta.md))

# data Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [available](#available)                             | `boolean` | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-available.md "undefined#/properties/available")                             |
| [categoriaMonotributo](#categoriamonotributo)       | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-categoriamonotributo.md "undefined#/properties/categoriaMonotributo")       |
| [condIva](#condiva)                                 | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-condiva.md "undefined#/properties/condIva")                                 |
| [cpost](#cpost)                                     | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-cpost.md "undefined#/properties/cpost")                                     |
| [cuit](#cuit)                                       | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-cuit.md "undefined#/properties/cuit")                                       |
| [domicilio](#domicilio)                             | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-domicilio.md "undefined#/properties/domicilio")                             |
| [estado](#estado)                                   | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-estado.md "undefined#/properties/estado")                                   |
| [fetchedAt](#fetchedat)                             | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-fetchedat.md "undefined#/properties/fetchedAt")                             |
| [fromCache](#fromcache)                             | `boolean` | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-fromcache.md "undefined#/properties/fromCache")                             |
| [localidad](#localidad)                             | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-localidad.md "undefined#/properties/localidad")                             |
| [razonSocial](#razonsocial)                         | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-razonsocial.md "undefined#/properties/razonSocial")                         |
| [razonSocialTruncada](#razonsocialtruncada)         | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-razonsocialtruncada.md "undefined#/properties/razonSocialTruncada")         |
| [razonSocialTruncadaFlag](#razonsocialtruncadaflag) | `boolean` | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-razonsocialtruncadaflag.md "undefined#/properties/razonSocialTruncadaFlag") |
| [reason](#reason)                                   | `string`  | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-reason.md "undefined#/properties/reason")                                   |
| [verificado](#verificado)                           | `boolean` | Required | cannot be null | [PadronA4Consulta](padrona4consulta-properties-verificado.md "undefined#/properties/verificado")                           |

## available



`available`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-available.md "undefined#/properties/available")

### available Type

`boolean`

## categoriaMonotributo



`categoriaMonotributo`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-categoriamonotributo.md "undefined#/properties/categoriaMonotributo")

### categoriaMonotributo Type

`string`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

### condIva Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"RI"`     |             |
| `"Mono"`   |             |
| `"CF"`     |             |
| `"Exento"` |             |
| `null`     |             |

## cpost



`cpost`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-cpost.md "undefined#/properties/cpost")

### cpost Type

`string`

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## domicilio



`domicilio`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-domicilio.md "undefined#/properties/domicilio")

### domicilio Type

`string`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"activo"`   |             |
| `"inactivo"` |             |
| `null`       |             |

## fetchedAt



`fetchedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-fetchedat.md "undefined#/properties/fetchedAt")

### fetchedAt Type

`string`

### fetchedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fromCache



`fromCache`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-fromcache.md "undefined#/properties/fromCache")

### fromCache Type

`boolean`

## localidad



`localidad`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-localidad.md "undefined#/properties/localidad")

### localidad Type

`string`

## razonSocial



`razonSocial`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-razonsocial.md "undefined#/properties/razonSocial")

### razonSocial Type

`string`

## razonSocialTruncada



`razonSocialTruncada`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-razonsocialtruncada.md "undefined#/properties/razonSocialTruncada")

### razonSocialTruncada Type

`string`

## razonSocialTruncadaFlag



`razonSocialTruncadaFlag`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-razonsocialtruncadaflag.md "undefined#/properties/razonSocialTruncadaFlag")

### razonSocialTruncadaFlag Type

`boolean`

## reason



`reason`

* is required

* Type: `string`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`

### reason Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"ok"`           |             |
| `"invalid_cuit"` |             |
| `"not_found"`    |             |
| `"unavailable"`  |             |
| `"timeout"`      |             |

## verificado



`verificado`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PadronA4Consulta](padrona4consulta-properties-verificado.md "undefined#/properties/verificado")

### verificado Type

`boolean`
