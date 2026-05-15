# AgingAr Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AgingArEnvelope.schema.json\*](../schema-json/AgingArEnvelope.schema.json "open original schema") |

## data Type

`object` ([AgingAr](agingar.md))

# data Properties

| Property                  | Type     | Required | Nullable       | Defined by                                                                     |
| :------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------- |
| [buckets](#buckets)       | `array`  | Required | cannot be null | [AgingAr](agingar-properties-buckets.md "undefined#/properties/buckets")       |
| [resumen](#resumen)       | `object` | Required | cannot be null | [AgingAr](agingarresumen.md "undefined#/properties/resumen")                   |
| [totalDeuda](#totaldeuda) | `string` | Required | cannot be null | [AgingAr](agingar-properties-totaldeuda.md "undefined#/properties/totalDeuda") |

## buckets



`buckets`

* is required

* Type: `object[]` ([AgingBucket](agingbucket.md))

* cannot be null

* defined in: [AgingAr](agingar-properties-buckets.md "undefined#/properties/buckets")

### buckets Type

`object[]` ([AgingBucket](agingbucket.md))

## resumen



`resumen`

* is required

* Type: `object` ([AgingArResumen](agingarresumen.md))

* cannot be null

* defined in: [AgingAr](agingarresumen.md "undefined#/properties/resumen")

### resumen Type

`object` ([AgingArResumen](agingarresumen.md))

## totalDeuda



`totalDeuda`

* is required

* Type: `string`

* cannot be null

* defined in: [AgingAr](agingar-properties-totaldeuda.md "undefined#/properties/totalDeuda")

### totalDeuda Type

`string`
