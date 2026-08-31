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

| Property                                                | Type     | Required | Nullable       | Defined by                                                                                                                         |
| :------------------------------------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [integrations](#integrations)                           | `array`  | Required | cannot be null | [TenantFeaturesData](tenantfeaturesdata-properties-integrations.md "undefined#/properties/integrations")                           |
| [jurisdiccionFiscal](#jurisdiccionfiscal)               | `string` | Required | cannot be null | [TenantFeaturesData](fiscaljurisdictioncode.md "undefined#/properties/jurisdiccionFiscal")                                         |
| [jurisdiccionesHabilitadas](#jurisdiccioneshabilitadas) | `array`  | Optional | cannot be null | [TenantFeaturesData](tenantfeaturesdata-properties-jurisdiccioneshabilitadas.md "undefined#/properties/jurisdiccionesHabilitadas") |
| [modules](#modules)                                     | `array`  | Required | cannot be null | [TenantFeaturesData](tenantfeaturesdata-properties-modules.md "undefined#/properties/modules")                                     |

## integrations



`integrations`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantFeaturesData](tenantfeaturesdata-properties-integrations.md "undefined#/properties/integrations")

### integrations Type

`string[]`

## jurisdiccionFiscal

Tenant tax jurisdiction (#207). Drives VAT rates, tax identifier validation and which modules are mandatory in production. Defaults to `AR`.

`jurisdiccionFiscal`

* is required

* Type: `string` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

* cannot be null

* defined in: [TenantFeaturesData](fiscaljurisdictioncode.md "undefined#/properties/jurisdiccionFiscal")

### jurisdiccionFiscal Type

`string` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

### jurisdiccionFiscal Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `"AR"` |             |
| `"UY"` |             |

## jurisdiccionesHabilitadas

Fiscal jurisdictions this installation offers (#437).

`jurisdiccionesHabilitadas`

* is optional

* Type: `string[]` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

* cannot be null

* defined in: [TenantFeaturesData](tenantfeaturesdata-properties-jurisdiccioneshabilitadas.md "undefined#/properties/jurisdiccionesHabilitadas")

### jurisdiccionesHabilitadas Type

`string[]` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

## modules



`modules`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantFeaturesData](tenantfeaturesdata-properties-modules.md "undefined#/properties/modules")

### modules Type

`string[]`
