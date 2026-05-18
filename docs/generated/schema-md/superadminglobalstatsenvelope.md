# SuperadminGlobalStatsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminGlobalStatsEnvelope.schema.json](../schema-json/SuperadminGlobalStatsEnvelope.schema.json "open original schema") |

## SuperadminGlobalStatsEnvelope Type

`object` ([SuperadminGlobalStatsEnvelope](superadminglobalstatsenvelope.md))

# SuperadminGlobalStatsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SuperadminGlobalStatsEnvelope](superadminglobalstats.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [SuperadminGlobalStatsEnvelope](superadminglobalstatsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SuperadminGlobalStats](superadminglobalstats.md))

* cannot be null

* defined in: [SuperadminGlobalStatsEnvelope](superadminglobalstats.md "undefined#/properties/data")

### data Type

`object` ([SuperadminGlobalStats](superadminglobalstats.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SuperadminGlobalStatsEnvelope](superadminglobalstatsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
