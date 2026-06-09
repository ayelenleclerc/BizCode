# TenantModuleTrialActivateBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantModuleTrialActivateBody.schema.json](../schema-json/TenantModuleTrialActivateBody.schema.json "open original schema") |

## TenantModuleTrialActivateBody Type

`object` ([TenantModuleTrialActivateBody](tenantmoduletrialactivatebody.md))

# TenantModuleTrialActivateBody Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                               |
| :---------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [days](#days)           | `integer` | Optional | cannot be null | [TenantModuleTrialActivateBody](tenantmoduletrialactivatebody-properties-days.md "undefined#/properties/days")           |
| [moduleKey](#modulekey) | `string`  | Required | cannot be null | [TenantModuleTrialActivateBody](tenantmoduletrialactivatebody-properties-modulekey.md "undefined#/properties/moduleKey") |
| [reason](#reason)       | `string`  | Optional | cannot be null | [TenantModuleTrialActivateBody](tenantmoduletrialactivatebody-properties-reason.md "undefined#/properties/reason")       |

## days



`days`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TenantModuleTrialActivateBody](tenantmoduletrialactivatebody-properties-days.md "undefined#/properties/days")

### days Type

`integer`

### days Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `1`

### days Default Value

The default value is:

```json
30
```

## moduleKey



`moduleKey`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantModuleTrialActivateBody](tenantmoduletrialactivatebody-properties-modulekey.md "undefined#/properties/moduleKey")

### moduleKey Type

`string`

## reason



`reason`

* is optional

* Type: `string`

* cannot be null

* defined in: [TenantModuleTrialActivateBody](tenantmoduletrialactivatebody-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`

### reason Constraints

**maximum length**: the maximum number of characters for this string is: `500`
