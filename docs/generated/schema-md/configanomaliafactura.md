# ConfigAnomaliaFactura Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigAnomaliaFacturaEnvelope.schema.json\*](../schema-json/ConfigAnomaliaFacturaEnvelope.schema.json "open original schema") |

## data Type

`object` ([ConfigAnomaliaFactura](configanomaliafactura.md))

# data Properties

| Property                                                | Type      | Required | Nullable       | Defined by                                                                                                                               |
| :------------------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)                                 | `string`  | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-createdat.md "undefined#/properties/createdAt")                                 |
| [discountThresholdPct](#discountthresholdpct)           | `number`  | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-discountthresholdpct.md "undefined#/properties/discountThresholdPct")           |
| [id](#id)                                               | `integer` | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-id.md "undefined#/properties/id")                                               |
| [minHistory](#minhistory)                               | `integer` | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-minhistory.md "undefined#/properties/minHistory")                               |
| [newCustomerCreditFraction](#newcustomercreditfraction) | `number`  | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-newcustomercreditfraction.md "undefined#/properties/newCustomerCreditFraction") |
| [tenantId](#tenantid)                                   | `integer` | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-tenantid.md "undefined#/properties/tenantId")                                   |
| [updatedAt](#updatedat)                                 | `string`  | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-updatedat.md "undefined#/properties/updatedAt")                                 |
| [zScoreThreshold](#zscorethreshold)                     | `number`  | Required | cannot be null | [ConfigAnomaliaFactura](configanomaliafactura-properties-zscorethreshold.md "undefined#/properties/zScoreThreshold")                     |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## discountThresholdPct



`discountThresholdPct`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-discountthresholdpct.md "undefined#/properties/discountThresholdPct")

### discountThresholdPct Type

`number`

### discountThresholdPct Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## minHistory



`minHistory`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-minhistory.md "undefined#/properties/minHistory")

### minHistory Type

`integer`

### minHistory Constraints

**maximum**: the value of this number must smaller than or equal to: `1000`

**minimum**: the value of this number must greater than or equal to: `1`

## newCustomerCreditFraction



`newCustomerCreditFraction`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-newcustomercreditfraction.md "undefined#/properties/newCustomerCreditFraction")

### newCustomerCreditFraction Type

`number`

### newCustomerCreditFraction Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0.01`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## zScoreThreshold



`zScoreThreshold`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigAnomaliaFactura](configanomaliafactura-properties-zscorethreshold.md "undefined#/properties/zScoreThreshold")

### zScoreThreshold Type

`number`

### zScoreThreshold Constraints

**maximum**: the value of this number must smaller than or equal to: `20`

**minimum**: the value of this number must greater than or equal to: `0.1`
