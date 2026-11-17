# CoberturaOS Schema

```txt
undefined#/properties/coberturas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ObraSocial.schema.json\*](../schema-json/ObraSocial.schema.json "open original schema") |

## items Type

`object` ([CoberturaOS](coberturaos.md))

# items Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                 |
| :---------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [cobertura](#cobertura)       | `number`  | Required | cannot be null | [CoberturaOS](coberturaos-properties-cobertura.md "undefined#/properties/cobertura")       |
| [createdAt](#createdat)       | `string`  | Required | cannot be null | [CoberturaOS](coberturaos-properties-createdat.md "undefined#/properties/createdAt")       |
| [id](#id)                     | `integer` | Required | cannot be null | [CoberturaOS](coberturaos-properties-id.md "undefined#/properties/id")                     |
| [obraSocialId](#obrasocialid) | `integer` | Required | cannot be null | [CoberturaOS](coberturaos-properties-obrasocialid.md "undefined#/properties/obraSocialId") |
| [tenantId](#tenantid)         | `integer` | Required | cannot be null | [CoberturaOS](coberturaos-properties-tenantid.md "undefined#/properties/tenantId")         |
| [tipoProducto](#tipoproducto) | `string`  | Required | cannot be null | [CoberturaOS](ostipoproducto.md "undefined#/properties/tipoProducto")                      |
| [updatedAt](#updatedat)       | `string`  | Required | cannot be null | [CoberturaOS](coberturaos-properties-updatedat.md "undefined#/properties/updatedAt")       |

## cobertura



`cobertura`

* is required

* Type: `number`

* cannot be null

* defined in: [CoberturaOS](coberturaos-properties-cobertura.md "undefined#/properties/cobertura")

### cobertura Type

`number`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [CoberturaOS](coberturaos-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [CoberturaOS](coberturaos-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## obraSocialId



`obraSocialId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CoberturaOS](coberturaos-properties-obrasocialid.md "undefined#/properties/obraSocialId")

### obraSocialId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CoberturaOS](coberturaos-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipoProducto



`tipoProducto`

* is required

* Type: `string` ([OsTipoProducto](ostipoproducto.md))

* cannot be null

* defined in: [CoberturaOS](ostipoproducto.md "undefined#/properties/tipoProducto")

### tipoProducto Type

`string` ([OsTipoProducto](ostipoproducto.md))

### tipoProducto Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"generico"`   |             |
| `"marca"`      |             |
| `"cronico"`    |             |
| `"oncologico"` |             |

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [CoberturaOS](coberturaos-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
