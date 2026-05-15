# AgingBucket Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AgingBucket.schema.json](../schema-json/AgingBucket.schema.json "open original schema") |

## AgingBucket Type

`object` ([AgingBucket](agingbucket.md))

# AgingBucket Properties

| Property        | Type      | Required | Nullable       | Defined by                                                                   |
| :-------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------- |
| [count](#count) | `integer` | Required | cannot be null | [AgingBucket](agingbucket-properties-count.md "undefined#/properties/count") |
| [label](#label) | `string`  | Required | cannot be null | [AgingBucket](agingbucket-properties-label.md "undefined#/properties/label") |
| [total](#total) | `string`  | Required | cannot be null | [AgingBucket](agingbucket-properties-total.md "undefined#/properties/total") |

## count



`count`

* is required

* Type: `integer`

* cannot be null

* defined in: [AgingBucket](agingbucket-properties-count.md "undefined#/properties/count")

### count Type

`integer`

### count Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## label



`label`

* is required

* Type: `string`

* cannot be null

* defined in: [AgingBucket](agingbucket-properties-label.md "undefined#/properties/label")

### label Type

`string`

### label Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"0-30d"`  |             |
| `"31-60d"` |             |
| `"61-90d"` |             |
| `">90d"`   |             |

## total

Decimal amount as string (two fractional digits)

`total`

* is required

* Type: `string`

* cannot be null

* defined in: [AgingBucket](agingbucket-properties-total.md "undefined#/properties/total")

### total Type

`string`
