# TenantConfig Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantConfigEnvelope.schema.json\*](../schema-json/TenantConfigEnvelope.schema.json "open original schema") |

## data Type

`object` ([TenantConfig](tenantconfig.md))

# data Properties

| Property                                  | Type      | Required | Nullable       | Defined by                                                                                   |
| :---------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [businessType](#businesstype)             | `string`  | Required | cannot be null | [TenantConfig](tenantconfig-properties-businesstype.md "undefined#/properties/businessType") |
| [integrations](#integrations)             | `array`   | Required | cannot be null | [TenantConfig](tenantconfig-properties-integrations.md "undefined#/properties/integrations") |
| [jurisdiccionFiscal](#jurisdiccionfiscal) | `string`  | Required | cannot be null | [TenantConfig](fiscaljurisdictioncode.md "undefined#/properties/jurisdiccionFiscal")         |
| [modules](#modules)                       | `array`   | Required | cannot be null | [TenantConfig](tenantconfig-properties-modules.md "undefined#/properties/modules")           |
| [plan](#plan)                             | `string`  | Required | cannot be null | [TenantConfig](tenantconfig-properties-plan.md "undefined#/properties/plan")                 |
| [rubros](#rubros)                         | `array`   | Required | cannot be null | [TenantConfig](tenantconfig-properties-rubros.md "undefined#/properties/rubros")             |
| [tenantId](#tenantid)                     | `integer` | Required | cannot be null | [TenantConfig](tenantconfig-properties-tenantid.md "undefined#/properties/tenantId")         |
| [updatedAt](#updatedat)                   | `string`  | Required | cannot be null | [TenantConfig](tenantconfig-properties-updatedat.md "undefined#/properties/updatedAt")       |

## businessType



`businessType`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-businesstype.md "undefined#/properties/businessType")

### businessType Type

`string`

### businessType Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"mayorista"` |             |
| `"minorista"` |             |
| `"ambos"`     |             |

## integrations



`integrations`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-integrations.md "undefined#/properties/integrations")

### integrations Type

`string[]`

## jurisdiccionFiscal

Tenant tax jurisdiction (#207). Drives VAT rates, tax identifier validation and which modules are mandatory in production. Defaults to `AR`.

`jurisdiccionFiscal`

* is required

* Type: `string` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

* cannot be null

* defined in: [TenantConfig](fiscaljurisdictioncode.md "undefined#/properties/jurisdiccionFiscal")

### jurisdiccionFiscal Type

`string` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

### jurisdiccionFiscal Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `"AR"` |             |
| `"UY"` |             |

## modules



`modules`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-modules.md "undefined#/properties/modules")

### modules Type

`string[]`

## plan



`plan`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

### plan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"starter"`    |             |
| `"pro"`        |             |
| `"enterprise"` |             |

## rubros



`rubros`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-rubros.md "undefined#/properties/rubros")

### rubros Type

`string[]`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantConfig](tenantconfig-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
