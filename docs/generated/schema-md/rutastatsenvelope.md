# RutaStatsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaStatsEnvelope.schema.json](../schema-json/RutaStatsEnvelope.schema.json "open original schema") |

## RutaStatsEnvelope Type

`object` ([RutaStatsEnvelope](rutastatsenvelope.md))

# RutaStatsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RutaStatsEnvelope](rutadiastats.md "undefined#/properties/data")                            |
| [success](#success) | `boolean` | Required | cannot be null | [RutaStatsEnvelope](rutastatsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RutaDiaStats](rutadiastats.md))

* cannot be null

* defined in: [RutaStatsEnvelope](rutadiastats.md "undefined#/properties/data")

### data Type

`object` ([RutaDiaStats](rutadiastats.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RutaStatsEnvelope](rutastatsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
