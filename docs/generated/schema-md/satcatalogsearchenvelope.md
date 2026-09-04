# SatCatalogSearchEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SatCatalogSearchEnvelope.schema.json](../schema-json/SatCatalogSearchEnvelope.schema.json "open original schema") |

## SatCatalogSearchEnvelope Type

`object` ([SatCatalogSearchEnvelope](satcatalogsearchenvelope.md))

# SatCatalogSearchEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [SatCatalogSearchEnvelope](satcatalogsearchenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [SatCatalogSearchEnvelope](satcatalogsearchenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([SatCatalogHit](satcataloghit.md))

* cannot be null

* defined in: [SatCatalogSearchEnvelope](satcatalogsearchenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([SatCatalogHit](satcataloghit.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SatCatalogSearchEnvelope](satcatalogsearchenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
