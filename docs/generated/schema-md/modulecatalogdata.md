# ModuleCatalogData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ModuleCatalogEnvelope.schema.json\*](../schema-json/ModuleCatalogEnvelope.schema.json "open original schema") |

## data Type

`object` ([ModuleCatalogData](modulecatalogdata.md))

# data Properties

| Property                        | Type     | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [deploymentEnv](#deploymentenv) | `string` | Required | cannot be null | [ModuleCatalogData](modulecatalogdata-properties-deploymentenv.md "undefined#/properties/deploymentEnv") |
| [modules](#modules)             | `array`  | Required | cannot be null | [ModuleCatalogData](modulecatalogdata-properties-modules.md "undefined#/properties/modules")             |
| [presets](#presets)             | `object` | Required | cannot be null | [ModuleCatalogData](modulecatalogdata-properties-presets.md "undefined#/properties/presets")             |

## deploymentEnv



`deploymentEnv`

* is required

* Type: `string`

* cannot be null

* defined in: [ModuleCatalogData](modulecatalogdata-properties-deploymentenv.md "undefined#/properties/deploymentEnv")

### deploymentEnv Type

`string`

### deploymentEnv Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value    | Explanation |
| :------- | :---------- |
| `"dev"`  |             |
| `"prod"` |             |

## modules



`modules`

* is required

* Type: `object[]` ([ModuleCatalogEntry](modulecatalogentry.md))

* cannot be null

* defined in: [ModuleCatalogData](modulecatalogdata-properties-modules.md "undefined#/properties/modules")

### modules Type

`object[]` ([ModuleCatalogEntry](modulecatalogentry.md))

## presets



`presets`

* is required

* Type: `object` ([Details](modulecatalogdata-properties-presets.md))

* cannot be null

* defined in: [ModuleCatalogData](modulecatalogdata-properties-presets.md "undefined#/properties/presets")

### presets Type

`object` ([Details](modulecatalogdata-properties-presets.md))
