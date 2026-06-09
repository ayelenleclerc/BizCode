# PublicPlan Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PublicPlan.schema.json](../schema-json/PublicPlan.schema.json "open original schema") |

## PublicPlan Type

`object` ([PublicPlan](publicplan.md))

# PublicPlan Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [currency](#currency)                       | `string`  | Required | cannot be null | [PublicPlan](publicplan-properties-currency.md "undefined#/properties/currency")                       |
| [features](#features)                       | `array`   | Required | cannot be null | [PublicPlan](publicplan-properties-features.md "undefined#/properties/features")                       |
| [key](#key)                                 | `string`  | Required | cannot be null | [PublicPlan](publicplan-properties-key.md "undefined#/properties/key")                                 |
| [maxInvoicesPerMonth](#maxinvoicespermonth) | `integer` | Required | cannot be null | [PublicPlan](publicplan-properties-maxinvoicespermonth.md "undefined#/properties/maxInvoicesPerMonth") |
| [maxUsers](#maxusers)                       | `integer` | Required | cannot be null | [PublicPlan](publicplan-properties-maxusers.md "undefined#/properties/maxUsers")                       |
| [monthlyPrice](#monthlyprice)               | `integer` | Required | cannot be null | [PublicPlan](publicplan-properties-monthlyprice.md "undefined#/properties/monthlyPrice")               |
| [name](#name)                               | `string`  | Required | cannot be null | [PublicPlan](publicplan-properties-name.md "undefined#/properties/name")                               |

## currency



`currency`

* is required

* Type: `string`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-currency.md "undefined#/properties/currency")

### currency Type

`string`

## features



`features`

* is required

* Type: `string[]`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-features.md "undefined#/properties/features")

### features Type

`string[]`

## key



`key`

* is required

* Type: `string`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-key.md "undefined#/properties/key")

### key Type

`string`

## maxInvoicesPerMonth



`maxInvoicesPerMonth`

* is required

* Type: `integer`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-maxinvoicespermonth.md "undefined#/properties/maxInvoicesPerMonth")

### maxInvoicesPerMonth Type

`integer`

## maxUsers



`maxUsers`

* is required

* Type: `integer`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-maxusers.md "undefined#/properties/maxUsers")

### maxUsers Type

`integer`

## monthlyPrice



`monthlyPrice`

* is required

* Type: `integer`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-monthlyprice.md "undefined#/properties/monthlyPrice")

### monthlyPrice Type

`integer`

## name



`name`

* is required

* Type: `string`

* cannot be null

* defined in: [PublicPlan](publicplan-properties-name.md "undefined#/properties/name")

### name Type

`string`
