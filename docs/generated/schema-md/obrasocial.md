# ObraSocial Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ObraSocialListEnvelope.schema.json\*](../schema-json/ObraSocialListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ObraSocial](obrasocial.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [activa](#activa)         | `boolean` | Required | cannot be null | [ObraSocial](obrasocial-properties-activa.md "undefined#/properties/activa")         |
| [coberturas](#coberturas) | `array`   | Optional | cannot be null | [ObraSocial](obrasocial-properties-coberturas.md "undefined#/properties/coberturas") |
| [codigo](#codigo)         | `string`  | Required | cannot be null | [ObraSocial](obrasocial-properties-codigo.md "undefined#/properties/codigo")         |
| [createdAt](#createdat)   | `string`  | Required | cannot be null | [ObraSocial](obrasocial-properties-createdat.md "undefined#/properties/createdAt")   |
| [id](#id)                 | `integer` | Required | cannot be null | [ObraSocial](obrasocial-properties-id.md "undefined#/properties/id")                 |
| [nombre](#nombre)         | `string`  | Required | cannot be null | [ObraSocial](obrasocial-properties-nombre.md "undefined#/properties/nombre")         |
| [tenantId](#tenantid)     | `integer` | Required | cannot be null | [ObraSocial](obrasocial-properties-tenantid.md "undefined#/properties/tenantId")     |
| [updatedAt](#updatedat)   | `string`  | Required | cannot be null | [ObraSocial](obrasocial-properties-updatedat.md "undefined#/properties/updatedAt")   |

## activa



`activa`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## coberturas



`coberturas`

* is optional

* Type: `object[]` ([CoberturaOS](coberturaos.md))

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-coberturas.md "undefined#/properties/coberturas")

### coberturas Type

`object[]` ([CoberturaOS](coberturaos.md))

## codigo



`codigo`

* is required

* Type: `string`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ObraSocial](obrasocial-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
