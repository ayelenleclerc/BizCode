# TenantFeaturesData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantFeaturesEnvelope.schema.json\*](../schema-json/TenantFeaturesEnvelope.schema.json "open original schema") |

## data Type

`object` ([TenantFeaturesData](tenantfeaturesdata.md))

# data Properties

| Property                      | Type    | Required | Nullable       | Defined by                                                                                               |
| :---------------------------- | :------ | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [integrations](#integrations) | `array` | Required | cannot be null | [TenantFeaturesData](tenantfeaturesdata-properties-integrations.md "undefined#/properties/integrations") |
| [modules](#modules)           | `array` | Required | cannot be null | [TenantFeaturesData](tenantfeaturesdata-properties-modules.md "undefined#/properties/modules")           |

## integrations



`integrations`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantFeaturesData](tenantfeaturesdata-properties-integrations.md "undefined#/properties/integrations")

### integrations Type

`string[]`

## modules



`modules`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantFeaturesData](tenantfeaturesdata-properties-modules.md "undefined#/properties/modules")

### modules Type

`string[]`
