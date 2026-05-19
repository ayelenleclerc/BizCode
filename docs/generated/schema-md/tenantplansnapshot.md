# TenantPlanSnapshot Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantPlanSnapshotEnvelope.schema.json\*](../schema-json/TenantPlanSnapshotEnvelope.schema.json "open original schema") |

## data Type

`object` ([TenantPlanSnapshot](tenantplansnapshot.md))

# data Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [currency](#currency)                       | `string`  | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-currency.md "undefined#/properties/currency")                       |
| [features](#features)                       | `array`   | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-features.md "undefined#/properties/features")                       |
| [maxInvoicesPerMonth](#maxinvoicespermonth) | `integer` | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-maxinvoicespermonth.md "undefined#/properties/maxInvoicesPerMonth") |
| [maxUsers](#maxusers)                       | `integer` | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-maxusers.md "undefined#/properties/maxUsers")                       |
| [monthlyPrice](#monthlyprice)               | `integer` | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-monthlyprice.md "undefined#/properties/monthlyPrice")               |
| [planKey](#plankey)                         | `string`  | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-plankey.md "undefined#/properties/planKey")                         |
| [planName](#planname)                       | `string`  | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-planname.md "undefined#/properties/planName")                       |
| [status](#status)                           | `string`  | Required | cannot be null | [TenantPlanSnapshot](tenantplansnapshot-properties-status.md "undefined#/properties/status")                           |
| [usage](#usage)                             | `object`  | Required | cannot be null | [TenantPlanSnapshot](tenantplanusage.md "undefined#/properties/usage")                                                 |

## currency



`currency`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-currency.md "undefined#/properties/currency")

### currency Type

`string`

## features



`features`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-features.md "undefined#/properties/features")

### features Type

`string[]`

## maxInvoicesPerMonth



`maxInvoicesPerMonth`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-maxinvoicespermonth.md "undefined#/properties/maxInvoicesPerMonth")

### maxInvoicesPerMonth Type

`integer`

## maxUsers



`maxUsers`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-maxusers.md "undefined#/properties/maxUsers")

### maxUsers Type

`integer`

## monthlyPrice



`monthlyPrice`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-monthlyprice.md "undefined#/properties/monthlyPrice")

### monthlyPrice Type

`integer`

## planKey



`planKey`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-plankey.md "undefined#/properties/planKey")

### planKey Type

`string`

## planName



`planName`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-planname.md "undefined#/properties/planName")

### planName Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplansnapshot-properties-status.md "undefined#/properties/status")

### status Type

`string`

## usage



`usage`

* is required

* Type: `object` ([TenantPlanUsage](tenantplanusage.md))

* cannot be null

* defined in: [TenantPlanSnapshot](tenantplanusage.md "undefined#/properties/usage")

### usage Type

`object` ([TenantPlanUsage](tenantplanusage.md))
