# ConfigAnomaliaFacturaUpsertInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigAnomaliaFacturaUpsertInput.schema.json](../schema-json/ConfigAnomaliaFacturaUpsertInput.schema.json "open original schema") |

## ConfigAnomaliaFacturaUpsertInput Type

`object` ([ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput.md))

# ConfigAnomaliaFacturaUpsertInput Properties

| Property                                                | Type      | Required | Nullable       | Defined by                                                                                                                                                     |
| :------------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [discountThresholdPct](#discountthresholdpct)           | `number`  | Required | cannot be null | [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-discountthresholdpct.md "undefined#/properties/discountThresholdPct")           |
| [minHistory](#minhistory)                               | `integer` | Required | cannot be null | [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-minhistory.md "undefined#/properties/minHistory")                               |
| [newCustomerCreditFraction](#newcustomercreditfraction) | `number`  | Required | cannot be null | [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-newcustomercreditfraction.md "undefined#/properties/newCustomerCreditFraction") |
| [zScoreThreshold](#zscorethreshold)                     | `number`  | Required | cannot be null | [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-zscorethreshold.md "undefined#/properties/zScoreThreshold")                     |

## discountThresholdPct



`discountThresholdPct`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-discountthresholdpct.md "undefined#/properties/discountThresholdPct")

### discountThresholdPct Type

`number`

### discountThresholdPct Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## minHistory



`minHistory`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-minhistory.md "undefined#/properties/minHistory")

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

* defined in: [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-newcustomercreditfraction.md "undefined#/properties/newCustomerCreditFraction")

### newCustomerCreditFraction Type

`number`

### newCustomerCreditFraction Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0.01`

## zScoreThreshold



`zScoreThreshold`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigAnomaliaFacturaUpsertInput](configanomaliafacturaupsertinput-properties-zscorethreshold.md "undefined#/properties/zScoreThreshold")

### zScoreThreshold Type

`number`

### zScoreThreshold Constraints

**maximum**: the value of this number must smaller than or equal to: `20`

**minimum**: the value of this number must greater than or equal to: `0.1`
