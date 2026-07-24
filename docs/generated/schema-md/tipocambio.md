# TipoCambio Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TipoCambioMutationEnvelope.schema.json\*](../schema-json/TipoCambioMutationEnvelope.schema.json "open original schema") |

## data Type

`object` ([TipoCambio](tipocambio.md))

# data Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                             |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [createdAt](#createdat)     | `string`  | Required | cannot be null | [TipoCambio](tipocambio-properties-createdat.md "undefined#/properties/createdAt")     |
| [createdById](#createdbyid) | `integer` | Required | cannot be null | [TipoCambio](tipocambio-properties-createdbyid.md "undefined#/properties/createdById") |
| [fecha](#fecha)             | `string`  | Required | cannot be null | [TipoCambio](tipocambio-properties-fecha.md "undefined#/properties/fecha")             |
| [fuente](#fuente)           | `string`  | Required | cannot be null | [TipoCambio](tipocambio-properties-fuente.md "undefined#/properties/fuente")           |
| [id](#id)                   | `integer` | Required | cannot be null | [TipoCambio](tipocambio-properties-id.md "undefined#/properties/id")                   |
| [moneda](#moneda)           | `string`  | Required | cannot be null | [TipoCambio](tipocambio-properties-moneda.md "undefined#/properties/moneda")           |
| [tenantId](#tenantid)       | `integer` | Required | cannot be null | [TipoCambio](tipocambio-properties-tenantid.md "undefined#/properties/tenantId")       |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [TipoCambio](tipocambio-properties-tipo.md "undefined#/properties/tipo")               |
| [valor](#valor)             | `number`  | Required | cannot be null | [TipoCambio](tipocambio-properties-valor.md "undefined#/properties/valor")             |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdById



`createdById`

* is required

* Type: `integer`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-createdbyid.md "undefined#/properties/createdById")

### createdById Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fuente



`fuente`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-fuente.md "undefined#/properties/fuente")

### fuente Type

`string`

### fuente Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"bcra_api"` |             |
| `"manual"`   |             |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value   | Explanation |
| :------ | :---------- |
| `"USD"` |             |
| `"EUR"` |             |

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"oficial"` |             |
| `"mep"`     |             |
| `"ccl"`     |             |
| `"blue"`    |             |
| `"manual"`  |             |

## valor



`valor`

* is required

* Type: `number`

* cannot be null

* defined in: [TipoCambio](tipocambio-properties-valor.md "undefined#/properties/valor")

### valor Type

`number`
