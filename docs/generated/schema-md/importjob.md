# ImportJob Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ImportJobEnvelope.schema.json\*](../schema-json/ImportJobEnvelope.schema.json "open original schema") |

## data Type

`object` ([ImportJob](importjob.md))

# data Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [completedAt](#completedat)       | `string`  | Required | cannot be null | [ImportJob](importjob-properties-completedat.md "undefined#/properties/completedAt")       |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [ImportJob](importjob-properties-createdat.md "undefined#/properties/createdAt")           |
| [createdById](#createdbyid)       | `integer` | Required | cannot be null | [ImportJob](importjob-properties-createdbyid.md "undefined#/properties/createdById")       |
| [createdCount](#createdcount)     | `integer` | Required | cannot be null | [ImportJob](importjob-properties-createdcount.md "undefined#/properties/createdCount")     |
| [duplicateCount](#duplicatecount) | `integer` | Required | cannot be null | [ImportJob](importjob-properties-duplicatecount.md "undefined#/properties/duplicateCount") |
| [duplicateMode](#duplicatemode)   | `string`  | Required | cannot be null | [ImportJob](importjob-properties-duplicatemode.md "undefined#/properties/duplicateMode")   |
| [entity](#entity)                 | `string`  | Required | cannot be null | [ImportJob](importjob-properties-entity.md "undefined#/properties/entity")                 |
| [errorCount](#errorcount)         | `integer` | Required | cannot be null | [ImportJob](importjob-properties-errorcount.md "undefined#/properties/errorCount")         |
| [estado](#estado)                 | `string`  | Required | cannot be null | [ImportJob](importjob-properties-estado.md "undefined#/properties/estado")                 |
| [id](#id)                         | `integer` | Required | cannot be null | [ImportJob](importjob-properties-id.md "undefined#/properties/id")                         |
| [modo](#modo)                     | `string`  | Required | cannot be null | [ImportJob](importjob-properties-modo.md "undefined#/properties/modo")                     |
| [okCount](#okcount)               | `integer` | Required | cannot be null | [ImportJob](importjob-properties-okcount.md "undefined#/properties/okCount")               |
| [processedRows](#processedrows)   | `integer` | Required | cannot be null | [ImportJob](importjob-properties-processedrows.md "undefined#/properties/processedRows")   |
| [skippedCount](#skippedcount)     | `integer` | Required | cannot be null | [ImportJob](importjob-properties-skippedcount.md "undefined#/properties/skippedCount")     |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [ImportJob](importjob-properties-tenantid.md "undefined#/properties/tenantId")             |
| [totalRows](#totalrows)           | `integer` | Required | cannot be null | [ImportJob](importjob-properties-totalrows.md "undefined#/properties/totalRows")           |
| [updatedAt](#updatedat)           | `string`  | Required | cannot be null | [ImportJob](importjob-properties-updatedat.md "undefined#/properties/updatedAt")           |
| [updatedCount](#updatedcount)     | `integer` | Required | cannot be null | [ImportJob](importjob-properties-updatedcount.md "undefined#/properties/updatedCount")     |

## completedAt



`completedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-completedat.md "undefined#/properties/completedAt")

### completedAt Type

`string`

### completedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdById



`createdById`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-createdbyid.md "undefined#/properties/createdById")

### createdById Type

`integer`

## createdCount



`createdCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-createdcount.md "undefined#/properties/createdCount")

### createdCount Type

`integer`

## duplicateCount



`duplicateCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-duplicatecount.md "undefined#/properties/duplicateCount")

### duplicateCount Type

`integer`

## duplicateMode



`duplicateMode`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-duplicatemode.md "undefined#/properties/duplicateMode")

### duplicateMode Type

`string`

### duplicateMode Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"update"` |             |
| `"skip"`   |             |

## entity



`entity`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-entity.md "undefined#/properties/entity")

### entity Type

`string`

### entity Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"articulos"`   |             |
| `"clientes"`    |             |
| `"proveedores"` |             |
| `"saldos"`      |             |

## errorCount



`errorCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-errorcount.md "undefined#/properties/errorCount")

### errorCount Type

`integer`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"validating"` |             |
| `"ready"`      |             |
| `"running"`    |             |
| `"completed"`  |             |
| `"failed"`     |             |
| `"cancelled"`  |             |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## modo



`modo`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-modo.md "undefined#/properties/modo")

### modo Type

`string`

### modo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                 | Explanation |
| :-------------------- | :---------- |
| `"mejores_esfuerzos"` |             |
| `"todo_o_nada"`       |             |

## okCount



`okCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-okcount.md "undefined#/properties/okCount")

### okCount Type

`integer`

## processedRows



`processedRows`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-processedrows.md "undefined#/properties/processedRows")

### processedRows Type

`integer`

## skippedCount



`skippedCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-skippedcount.md "undefined#/properties/skippedCount")

### skippedCount Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## totalRows



`totalRows`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-totalrows.md "undefined#/properties/totalRows")

### totalRows Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ImportJob](importjob-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## updatedCount



`updatedCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [ImportJob](importjob-properties-updatedcount.md "undefined#/properties/updatedCount")

### updatedCount Type

`integer`
