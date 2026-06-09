# RepartoProgress Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoProgress.schema.json](../schema-json/RepartoProgress.schema.json "open original schema") |

## RepartoProgress Type

`object` ([RepartoProgress](repartoprogress.md))

# RepartoProgress Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                   |
| :---------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [delivered](#delivered) | `integer` | Required | cannot be null | [RepartoProgress](repartoprogress-properties-delivered.md "undefined#/properties/delivered") |
| [pending](#pending)     | `integer` | Required | cannot be null | [RepartoProgress](repartoprogress-properties-pending.md "undefined#/properties/pending")     |
| [total](#total)         | `integer` | Required | cannot be null | [RepartoProgress](repartoprogress-properties-total.md "undefined#/properties/total")         |

## delivered



`delivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoProgress](repartoprogress-properties-delivered.md "undefined#/properties/delivered")

### delivered Type

`integer`

### delivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## pending



`pending`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoProgress](repartoprogress-properties-pending.md "undefined#/properties/pending")

### pending Type

`integer`

### pending Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoProgress](repartoprogress-properties-total.md "undefined#/properties/total")

### total Type

`integer`

### total Constraints

**minimum**: the value of this number must greater than or equal to: `0`
