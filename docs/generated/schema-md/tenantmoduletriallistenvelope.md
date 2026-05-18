# TenantModuleTrialListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantModuleTrialListEnvelope.schema.json](../schema-json/TenantModuleTrialListEnvelope.schema.json "open original schema") |

## TenantModuleTrialListEnvelope Type

`object` ([TenantModuleTrialListEnvelope](tenantmoduletriallistenvelope.md))

# TenantModuleTrialListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [TenantModuleTrialListEnvelope](tenantmoduletriallistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [TenantModuleTrialListEnvelope](tenantmoduletriallistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([TenantModuleTrial](tenantmoduletrial.md))

* cannot be null

* defined in: [TenantModuleTrialListEnvelope](tenantmoduletriallistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([TenantModuleTrial](tenantmoduletrial.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TenantModuleTrialListEnvelope](tenantmoduletriallistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
