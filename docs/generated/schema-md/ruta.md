# Ruta Schema

```txt
undefined#/properties/data/oneOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaMaybeEnvelope.schema.json\*](../schema-json/RutaMaybeEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Ruta](ruta.md))

# 0 Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                               |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------- |
| [createdAt](#createdat)   | `string`  | Required | cannot be null | [Ruta](ruta-properties-createdat.md "undefined#/properties/createdAt")   |
| [fecha](#fecha)           | `string`  | Required | cannot be null | [Ruta](ruta-properties-fecha.md "undefined#/properties/fecha")           |
| [id](#id)                 | `integer` | Required | cannot be null | [Ruta](ruta-properties-id.md "undefined#/properties/id")                 |
| [paradas](#paradas)       | `array`   | Required | cannot be null | [Ruta](ruta-properties-paradas.md "undefined#/properties/paradas")       |
| [tenantId](#tenantid)     | `integer` | Required | cannot be null | [Ruta](ruta-properties-tenantid.md "undefined#/properties/tenantId")     |
| [updatedAt](#updatedat)   | `string`  | Required | cannot be null | [Ruta](ruta-properties-updatedat.md "undefined#/properties/updatedAt")   |
| [vendedor](#vendedor)     | `object`  | Optional | cannot be null | [Ruta](ruta-properties-vendedor.md "undefined#/properties/vendedor")     |
| [vendedorId](#vendedorid) | `integer` | Required | cannot be null | [Ruta](ruta-properties-vendedorid.md "undefined#/properties/vendedorId") |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Ruta](ruta-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [Ruta](ruta-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ruta](ruta-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## paradas



`paradas`

* is required

* Type: `object[]` ([RutaParada](rutaparada.md))

* cannot be null

* defined in: [Ruta](ruta-properties-paradas.md "undefined#/properties/paradas")

### paradas Type

`object[]` ([RutaParada](rutaparada.md))

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ruta](ruta-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Ruta](ruta-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedor



`vendedor`

* is optional

* Type: `object` ([Details](ruta-properties-vendedor.md))

* cannot be null

* defined in: [Ruta](ruta-properties-vendedor.md "undefined#/properties/vendedor")

### vendedor Type

`object` ([Details](ruta-properties-vendedor.md))

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Ruta](ruta-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`
