# LogisticaKpis Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LogisticaKpisEnvelope.schema.json\*](../schema-json/LogisticaKpisEnvelope.schema.json "open original schema") |

## data Type

`object` ([LogisticaKpis](logisticakpis.md))

# data Properties

| Property                                              | Type      | Required | Nullable       | Defined by                                                                                                             |
| :---------------------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [avgDeliveryMinutes](#avgdeliveryminutes)             | `number`  | Required | cannot be null | [LogisticaKpis](logisticakpis-properties-avgdeliveryminutes.md "undefined#/properties/avgDeliveryMinutes")             |
| [dispatchedCount](#dispatchedcount)                   | `integer` | Required | cannot be null | [LogisticaKpis](logisticakpis-properties-dispatchedcount.md "undefined#/properties/dispatchedCount")                   |
| [firstVisitDeliveredCount](#firstvisitdeliveredcount) | `integer` | Required | cannot be null | [LogisticaKpis](logisticakpis-properties-firstvisitdeliveredcount.md "undefined#/properties/firstVisitDeliveredCount") |
| [firstVisitRate](#firstvisitrate)                     | `number`  | Required | cannot be null | [LogisticaKpis](logisticakpis-properties-firstvisitrate.md "undefined#/properties/firstVisitRate")                     |
| [overdueCount](#overduecount)                         | `integer` | Required | cannot be null | [LogisticaKpis](logisticakpis-properties-overduecount.md "undefined#/properties/overdueCount")                         |
| [returnsByReason](#returnsbyreason)                   | `array`   | Required | cannot be null | [LogisticaKpis](logisticakpis-properties-returnsbyreason.md "undefined#/properties/returnsByReason")                   |

## avgDeliveryMinutes



`avgDeliveryMinutes`

* is required

* Type: `number`

* cannot be null

* defined in: [LogisticaKpis](logisticakpis-properties-avgdeliveryminutes.md "undefined#/properties/avgDeliveryMinutes")

### avgDeliveryMinutes Type

`number`

## dispatchedCount



`dispatchedCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaKpis](logisticakpis-properties-dispatchedcount.md "undefined#/properties/dispatchedCount")

### dispatchedCount Type

`integer`

### dispatchedCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## firstVisitDeliveredCount



`firstVisitDeliveredCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaKpis](logisticakpis-properties-firstvisitdeliveredcount.md "undefined#/properties/firstVisitDeliveredCount")

### firstVisitDeliveredCount Type

`integer`

### firstVisitDeliveredCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## firstVisitRate



`firstVisitRate`

* is required

* Type: `number`

* cannot be null

* defined in: [LogisticaKpis](logisticakpis-properties-firstvisitrate.md "undefined#/properties/firstVisitRate")

### firstVisitRate Type

`number`

### firstVisitRate Constraints

**maximum**: the value of this number must smaller than or equal to: `1`

**minimum**: the value of this number must greater than or equal to: `0`

## overdueCount



`overdueCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaKpis](logisticakpis-properties-overduecount.md "undefined#/properties/overdueCount")

### overdueCount Type

`integer`

### overdueCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## returnsByReason



`returnsByReason`

* is required

* Type: `object[]` ([LogisticaReturnReasonRow](logisticareturnreasonrow.md))

* cannot be null

* defined in: [LogisticaKpis](logisticakpis-properties-returnsbyreason.md "undefined#/properties/returnsByReason")

### returnsByReason Type

`object[]` ([LogisticaReturnReasonRow](logisticareturnreasonrow.md))
