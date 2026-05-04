# ListPaginationMeta Schema

```txt
undefined#/allOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RubroListEnvelope.schema.json\*](../schema-json/RubroListEnvelope.schema.json "open original schema") |

## 1 Type

`object` ([ListPaginationMeta](listpaginationmeta.md))

# 1 Properties

| Property          | Type      | Required | Nullable       | Defined by                                                                                   |
| :---------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [limit](#limit)   | `integer` | Required | cannot be null | [ListPaginationMeta](listpaginationmeta-properties-limit.md "undefined#/properties/limit")   |
| [offset](#offset) | `integer` | Required | cannot be null | [ListPaginationMeta](listpaginationmeta-properties-offset.md "undefined#/properties/offset") |
| [total](#total)   | `integer` | Required | cannot be null | [ListPaginationMeta](listpaginationmeta-properties-total.md "undefined#/properties/total")   |

## limit

Effective page size (same semantics as query `limit`)

`limit`

* is required

* Type: `integer`

* cannot be null

* defined in: [ListPaginationMeta](listpaginationmeta-properties-limit.md "undefined#/properties/limit")

### limit Type

`integer`

### limit Constraints

**maximum**: the value of this number must smaller than or equal to: `500`

**minimum**: the value of this number must greater than or equal to: `1`

## offset

Effective skip (same semantics as query `offset`)

`offset`

* is required

* Type: `integer`

* cannot be null

* defined in: [ListPaginationMeta](listpaginationmeta-properties-offset.md "undefined#/properties/offset")

### offset Type

`integer`

### offset Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## total

Row count matching the list filter (before limit/offset)

`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [ListPaginationMeta](listpaginationmeta-properties-total.md "undefined#/properties/total")

### total Type

`integer`

### total Constraints

**minimum**: the value of this number must greater than or equal to: `0`
