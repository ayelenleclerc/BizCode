# TenantConfigUpsertBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantConfigUpsertBody.schema.json](../schema-json/TenantConfigUpsertBody.schema.json "open original schema") |

## TenantConfigUpsertBody Type

`object` ([TenantConfigUpsertBody](tenantconfigupsertbody.md))

# TenantConfigUpsertBody Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                       |
| :---------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [businessType](#businesstype) | `string` | Optional | cannot be null | [TenantConfigUpsertBody](tenantconfigupsertbody-properties-businesstype.md "undefined#/properties/businessType") |
| [integrations](#integrations) | `array`  | Optional | cannot be null | [TenantConfigUpsertBody](tenantconfigupsertbody-properties-integrations.md "undefined#/properties/integrations") |
| [modules](#modules)           | `array`  | Required | cannot be null | [TenantConfigUpsertBody](tenantconfigupsertbody-properties-modules.md "undefined#/properties/modules")           |
| [plan](#plan)                 | `string` | Optional | cannot be null | [TenantConfigUpsertBody](tenantconfigupsertbody-properties-plan.md "undefined#/properties/plan")                 |
| [reason](#reason)             | `string` | Required | cannot be null | [TenantConfigUpsertBody](tenantconfigupsertbody-properties-reason.md "undefined#/properties/reason")             |
| [rubros](#rubros)             | `array`  | Optional | cannot be null | [TenantConfigUpsertBody](tenantconfigupsertbody-properties-rubros.md "undefined#/properties/rubros")             |

## businessType



`businessType`

* is optional

* Type: `string`

* cannot be null

* defined in: [TenantConfigUpsertBody](tenantconfigupsertbody-properties-businesstype.md "undefined#/properties/businessType")

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

* is optional

* Type: `string[]`

* cannot be null

* defined in: [TenantConfigUpsertBody](tenantconfigupsertbody-properties-integrations.md "undefined#/properties/integrations")

### integrations Type

`string[]`

## modules



`modules`

* is required

* Type: `string[]`

* cannot be null

* defined in: [TenantConfigUpsertBody](tenantconfigupsertbody-properties-modules.md "undefined#/properties/modules")

### modules Type

`string[]`

## plan



`plan`

* is optional

* Type: `string`

* cannot be null

* defined in: [TenantConfigUpsertBody](tenantconfigupsertbody-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

### plan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"starter"`    |             |
| `"pro"`        |             |
| `"enterprise"` |             |

## reason



`reason`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantConfigUpsertBody](tenantconfigupsertbody-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`

### reason Constraints

**maximum length**: the maximum number of characters for this string is: `500`

**minimum length**: the minimum number of characters for this string is: `1`

## rubros



`rubros`

* is optional

* Type: `string[]`

* cannot be null

* defined in: [TenantConfigUpsertBody](tenantconfigupsertbody-properties-rubros.md "undefined#/properties/rubros")

### rubros Type

`string[]`
