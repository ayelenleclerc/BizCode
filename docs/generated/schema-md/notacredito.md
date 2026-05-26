# NotaCredito Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [NotaCredito.schema.json](../schema-json/NotaCredito.schema.json "open original schema") |

## NotaCredito Type

`object` ([NotaCredito](notacredito.md))

# NotaCredito Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                       |
| :---------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [cae](#cae)                         | `string`  | Optional | cannot be null | [NotaCredito](notacredito-properties-cae.md "undefined#/properties/cae")                         |
| [caeVto](#caevto)                   | `string`  | Optional | cannot be null | [NotaCredito](notacredito-properties-caevto.md "undefined#/properties/caeVto")                   |
| [createdAt](#createdat)             | `string`  | Required | cannot be null | [NotaCredito](notacredito-properties-createdat.md "undefined#/properties/createdAt")             |
| [createdById](#createdbyid)         | `integer` | Optional | cannot be null | [NotaCredito](notacredito-properties-createdbyid.md "undefined#/properties/createdById")         |
| [estadoCae](#estadocae)             | `string`  | Required | cannot be null | [NotaCredito](notacredito-properties-estadocae.md "undefined#/properties/estadoCae")             |
| [facturaOrigenId](#facturaorigenid) | `integer` | Required | cannot be null | [NotaCredito](notacredito-properties-facturaorigenid.md "undefined#/properties/facturaOrigenId") |
| [id](#id)                           | `integer` | Required | cannot be null | [NotaCredito](notacredito-properties-id.md "undefined#/properties/id")                           |
| [monto](#monto)                     | Merged    | Required | cannot be null | [NotaCredito](notacredito-properties-monto.md "undefined#/properties/monto")                     |
| [motivo](#motivo)                   | `string`  | Required | cannot be null | [NotaCredito](notacredito-properties-motivo.md "undefined#/properties/motivo")                   |
| [tenantId](#tenantid)               | `integer` | Required | cannot be null | [NotaCredito](notacredito-properties-tenantid.md "undefined#/properties/tenantId")               |
| Additional Properties               | Any       | Optional | can be null    |                                                                                                  |

## cae



`cae`

* is optional

* Type: `string`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-cae.md "undefined#/properties/cae")

### cae Type

`string`

## caeVto



`caeVto`

* is optional

* Type: `string`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-caevto.md "undefined#/properties/caeVto")

### caeVto Type

`string`

### caeVto Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdById



`createdById`

* is optional

* Type: `integer`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-createdbyid.md "undefined#/properties/createdById")

### createdById Type

`integer`

## estadoCae



`estadoCae`

* is required

* Type: `string`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-estadocae.md "undefined#/properties/estadoCae")

### estadoCae Type

`string`

### estadoCae Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"pending"`      |             |
| `"issued"`       |             |
| `"failed"`       |             |
| `"not_required"` |             |

## facturaOrigenId



`facturaOrigenId`

* is required

* Type: `integer`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-facturaorigenid.md "undefined#/properties/facturaOrigenId")

### facturaOrigenId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## monto



`monto`

* is required

* Type: merged type ([Details](notacredito-properties-monto.md))

* cannot be null

* defined in: [NotaCredito](notacredito-properties-monto.md "undefined#/properties/monto")

### monto Type

merged type ([Details](notacredito-properties-monto.md))

one (and only one) of

* [Untitled number in NotaCredito](notacredito-properties-monto-oneof-0.md "check type definition")

* [Untitled string in NotaCredito](notacredito-properties-monto-oneof-1.md "check type definition")

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [NotaCredito](notacredito-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
