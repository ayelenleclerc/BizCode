# RepartoCloseSummary Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoCloseSummary.schema.json](../schema-json/RepartoCloseSummary.schema.json "open original schema") |

## RepartoCloseSummary Type

`object` ([RepartoCloseSummary](repartoclosesummary.md))

# RepartoCloseSummary Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [delivered](#delivered)         | `integer` | Required | cannot be null | [RepartoCloseSummary](repartoclosesummary-properties-delivered.md "undefined#/properties/delivered")         |
| [notDelivered](#notdelivered)   | `integer` | Required | cannot be null | [RepartoCloseSummary](repartoclosesummary-properties-notdelivered.md "undefined#/properties/notDelivered")   |
| [pendingClosed](#pendingclosed) | `integer` | Required | cannot be null | [RepartoCloseSummary](repartoclosesummary-properties-pendingclosed.md "undefined#/properties/pendingClosed") |
| [returned](#returned)           | `integer` | Required | cannot be null | [RepartoCloseSummary](repartoclosesummary-properties-returned.md "undefined#/properties/returned")           |

## delivered



`delivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoCloseSummary](repartoclosesummary-properties-delivered.md "undefined#/properties/delivered")

### delivered Type

`integer`

### delivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## notDelivered



`notDelivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoCloseSummary](repartoclosesummary-properties-notdelivered.md "undefined#/properties/notDelivered")

### notDelivered Type

`integer`

### notDelivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## pendingClosed



`pendingClosed`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoCloseSummary](repartoclosesummary-properties-pendingclosed.md "undefined#/properties/pendingClosed")

### pendingClosed Type

`integer`

### pendingClosed Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## returned



`returned`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoCloseSummary](repartoclosesummary-properties-returned.md "undefined#/properties/returned")

### returned Type

`integer`

### returned Constraints

**minimum**: the value of this number must greater than or equal to: `0`
