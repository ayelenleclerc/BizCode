# SatCatalogHit Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SatCatalogSearchEnvelope.schema.json\*](../schema-json/SatCatalogSearchEnvelope.schema.json "open original schema") |

## items Type

`object` ([SatCatalogHit](satcataloghit.md))

# items Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                   |
| :-------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [catalog](#catalog)         | `string` | Required | cannot be null | [SatCatalogHit](satcataloghit-properties-catalog.md "undefined#/properties/catalog")         |
| [code](#code)               | `string` | Required | cannot be null | [SatCatalogHit](satcataloghit-properties-code.md "undefined#/properties/code")               |
| [description](#description) | `string` | Required | cannot be null | [SatCatalogHit](satcataloghit-properties-description.md "undefined#/properties/description") |
| [sourceLabel](#sourcelabel) | `string` | Required | cannot be null | [SatCatalogHit](satcataloghit-properties-sourcelabel.md "undefined#/properties/sourceLabel") |

## catalog



`catalog`

* is required

* Type: `string`

* cannot be null

* defined in: [SatCatalogHit](satcataloghit-properties-catalog.md "undefined#/properties/catalog")

### catalog Type

`string`

## code



`code`

* is required

* Type: `string`

* cannot be null

* defined in: [SatCatalogHit](satcataloghit-properties-code.md "undefined#/properties/code")

### code Type

`string`

## description



`description`

* is required

* Type: `string`

* cannot be null

* defined in: [SatCatalogHit](satcataloghit-properties-description.md "undefined#/properties/description")

### description Type

`string`

## sourceLabel



`sourceLabel`

* is required

* Type: `string`

* cannot be null

* defined in: [SatCatalogHit](satcataloghit-properties-sourcelabel.md "undefined#/properties/sourceLabel")

### sourceLabel Type

`string`
