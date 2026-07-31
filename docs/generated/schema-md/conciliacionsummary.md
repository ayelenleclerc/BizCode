# ConciliacionSummary Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConciliacionSummary.schema.json](../schema-json/ConciliacionSummary.schema.json "open original schema") |

## ConciliacionSummary Type

`object` ([ConciliacionSummary](conciliacionsummary.md))

# ConciliacionSummary Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                     |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [bankFees](#bankfees)             | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-bankfees.md "undefined#/properties/bankFees")             |
| [ignored](#ignored)               | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-ignored.md "undefined#/properties/ignored")               |
| [matchedAuto](#matchedauto)       | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-matchedauto.md "undefined#/properties/matchedAuto")       |
| [matchedManual](#matchedmanual)   | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-matchedmanual.md "undefined#/properties/matchedManual")   |
| [openCandidates](#opencandidates) | `object`  | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-opencandidates.md "undefined#/properties/openCandidates") |
| [suggested](#suggested)           | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-suggested.md "undefined#/properties/suggested")           |
| [total](#total)                   | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-total.md "undefined#/properties/total")                   |
| [unmatched](#unmatched)           | `integer` | Required | cannot be null | [ConciliacionSummary](conciliacionsummary-properties-unmatched.md "undefined#/properties/unmatched")           |

## bankFees



`bankFees`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-bankfees.md "undefined#/properties/bankFees")

### bankFees Type

`integer`

## ignored



`ignored`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-ignored.md "undefined#/properties/ignored")

### ignored Type

`integer`

## matchedAuto



`matchedAuto`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-matchedauto.md "undefined#/properties/matchedAuto")

### matchedAuto Type

`integer`

## matchedManual



`matchedManual`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-matchedmanual.md "undefined#/properties/matchedManual")

### matchedManual Type

`integer`

## openCandidates



`openCandidates`

* is required

* Type: `object` ([Details](conciliacionsummary-properties-opencandidates.md))

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-opencandidates.md "undefined#/properties/openCandidates")

### openCandidates Type

`object` ([Details](conciliacionsummary-properties-opencandidates.md))

## suggested



`suggested`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-suggested.md "undefined#/properties/suggested")

### suggested Type

`integer`

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-total.md "undefined#/properties/total")

### total Type

`integer`

## unmatched



`unmatched`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliacionSummary](conciliacionsummary-properties-unmatched.md "undefined#/properties/unmatched")

### unmatched Type

`integer`
