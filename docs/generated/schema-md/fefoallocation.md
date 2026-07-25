# FefoAllocation Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FefoAllocationListEnvelope.schema.json\*](../schema-json/FefoAllocationListEnvelope.schema.json "open original schema") |

## items Type

`object` ([FefoAllocation](fefoallocation.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [cantidad](#cantidad)                 | `integer` | Required | cannot be null | [FefoAllocation](fefoallocation-properties-cantidad.md "undefined#/properties/cantidad")                 |
| [fechaVencimiento](#fechavencimiento) | `string`  | Required | cannot be null | [FefoAllocation](fefoallocation-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento") |
| [loteId](#loteid)                     | `integer` | Required | cannot be null | [FefoAllocation](fefoallocation-properties-loteid.md "undefined#/properties/loteId")                     |
| [nroLote](#nrolote)                   | `string`  | Required | cannot be null | [FefoAllocation](fefoallocation-properties-nrolote.md "undefined#/properties/nroLote")                   |

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [FefoAllocation](fefoallocation-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

## fechaVencimiento



`fechaVencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [FefoAllocation](fefoallocation-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

### fechaVencimiento Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## loteId



`loteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FefoAllocation](fefoallocation-properties-loteid.md "undefined#/properties/loteId")

### loteId Type

`integer`

## nroLote



`nroLote`

* is required

* Type: `string`

* cannot be null

* defined in: [FefoAllocation](fefoallocation-properties-nrolote.md "undefined#/properties/nroLote")

### nroLote Type

`string`
