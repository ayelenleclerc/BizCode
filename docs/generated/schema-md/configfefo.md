# ConfigFefo Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigFefoEnvelope.schema.json\*](../schema-json/ConfigFefoEnvelope.schema.json "open original schema") |

## data Type

`object` ([ConfigFefo](configfefo.md))

# data Properties

| Property                                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :---------------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)                         | `string`  | Required | cannot be null | [ConfigFefo](configfefo-properties-createdat.md "undefined#/properties/createdAt")                         |
| [diasAlertaVencimiento](#diasalertavencimiento) | `integer` | Required | cannot be null | [ConfigFefo](configfefo-properties-diasalertavencimiento.md "undefined#/properties/diasAlertaVencimiento") |
| [id](#id)                                       | `integer` | Required | cannot be null | [ConfigFefo](configfefo-properties-id.md "undefined#/properties/id")                                       |
| [tenantId](#tenantid)                           | `integer` | Required | cannot be null | [ConfigFefo](configfefo-properties-tenantid.md "undefined#/properties/tenantId")                           |
| [updatedAt](#updatedat)                         | `string`  | Required | cannot be null | [ConfigFefo](configfefo-properties-updatedat.md "undefined#/properties/updatedAt")                         |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigFefo](configfefo-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## diasAlertaVencimiento



`diasAlertaVencimiento`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFefo](configfefo-properties-diasalertavencimiento.md "undefined#/properties/diasAlertaVencimiento")

### diasAlertaVencimiento Type

`integer`

### diasAlertaVencimiento Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `1`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFefo](configfefo-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFefo](configfefo-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigFefo](configfefo-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
