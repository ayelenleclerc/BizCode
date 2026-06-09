# TenantPricingData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantPricingEnvelope.schema.json\*](../schema-json/TenantPricingEnvelope.schema.json "open original schema") |

## data Type

`object` ([TenantPricingData](tenantpricingdata.md))

# data Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                             |
| :---------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [addons](#addons)             | `array`  | Required | cannot be null | [TenantPricingData](tenantpricingdata-properties-addons.md "undefined#/properties/addons")             |
| [basePrice](#baseprice)       | `number` | Required | cannot be null | [TenantPricingData](tenantpricingdata-properties-baseprice.md "undefined#/properties/basePrice")       |
| [plan](#plan)                 | `string` | Required | cannot be null | [TenantPricingData](tenantpricingdata-properties-plan.md "undefined#/properties/plan")                 |
| [totalMonthly](#totalmonthly) | `number` | Required | cannot be null | [TenantPricingData](tenantpricingdata-properties-totalmonthly.md "undefined#/properties/totalMonthly") |

## addons



`addons`

* is required

* Type: `object[]` ([TenantPricingAddon](tenantpricingaddon.md))

* cannot be null

* defined in: [TenantPricingData](tenantpricingdata-properties-addons.md "undefined#/properties/addons")

### addons Type

`object[]` ([TenantPricingAddon](tenantpricingaddon.md))

## basePrice



`basePrice`

* is required

* Type: `number`

* cannot be null

* defined in: [TenantPricingData](tenantpricingdata-properties-baseprice.md "undefined#/properties/basePrice")

### basePrice Type

`number`

### basePrice Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## plan



`plan`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPricingData](tenantpricingdata-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

## totalMonthly



`totalMonthly`

* is required

* Type: `number`

* cannot be null

* defined in: [TenantPricingData](tenantpricingdata-properties-totalmonthly.md "undefined#/properties/totalMonthly")

### totalMonthly Type

`number`

### totalMonthly Constraints

**minimum**: the value of this number must greater than or equal to: `0`
