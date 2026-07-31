# ConciliacionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConciliacionEnvelope.schema.json](../schema-json/ConciliacionEnvelope.schema.json "open original schema") |

## ConciliacionEnvelope Type

`object` ([ConciliacionEnvelope](conciliacionenvelope.md))

# ConciliacionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ConciliacionEnvelope](conciliaciondata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [ConciliacionEnvelope](conciliacionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ConciliacionData](conciliaciondata.md))

* cannot be null

* defined in: [ConciliacionEnvelope](conciliaciondata.md "undefined#/properties/data")

### data Type

`object` ([ConciliacionData](conciliaciondata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConciliacionEnvelope](conciliacionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`
