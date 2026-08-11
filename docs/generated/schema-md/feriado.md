# Feriado Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FeriadoListEnvelope.schema.json\*](../schema-json/FeriadoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Feriado](feriado.md))

# items Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                   |
| :---------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------- |
| [createdAt](#createdat) | `string`  | Required | cannot be null | [Feriado](feriado-properties-createdat.md "undefined#/properties/createdAt") |
| [fecha](#fecha)         | `string`  | Required | cannot be null | [Feriado](feriado-properties-fecha.md "undefined#/properties/fecha")         |
| [id](#id)               | `integer` | Required | cannot be null | [Feriado](feriado-properties-id.md "undefined#/properties/id")               |
| [nombre](#nombre)       | `string`  | Required | cannot be null | [Feriado](feriado-properties-nombre.md "undefined#/properties/nombre")       |
| [provincia](#provincia) | `string`  | Required | cannot be null | [Feriado](feriado-properties-provincia.md "undefined#/properties/provincia") |
| [tenantId](#tenantid)   | `integer` | Required | cannot be null | [Feriado](feriado-properties-tenantid.md "undefined#/properties/tenantId")   |
| [tipo](#tipo)           | `string`  | Required | cannot be null | [Feriado](feriadotipo.md "undefined#/properties/tipo")                       |
| [updatedAt](#updatedat) | `string`  | Required | cannot be null | [Feriado](feriado-properties-updatedat.md "undefined#/properties/updatedAt") |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Feriado](feriado-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [Feriado](feriado-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Feriado](feriado-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [Feriado](feriado-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## provincia



`provincia`

* is required

* Type: `string`

* cannot be null

* defined in: [Feriado](feriado-properties-provincia.md "undefined#/properties/provincia")

### provincia Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Feriado](feriado-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string` ([FeriadoTipo](feriadotipo.md))

* cannot be null

* defined in: [Feriado](feriadotipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([FeriadoTipo](feriadotipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"nacional"`   |             |
| `"provincial"` |             |
| `"local"`      |             |

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Feriado](feriado-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
