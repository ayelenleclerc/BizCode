# TenantConfigApplyTemplateBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantConfigApplyTemplateBody.schema.json](../schema-json/TenantConfigApplyTemplateBody.schema.json "open original schema") |

## TenantConfigApplyTemplateBody Type

`object` ([TenantConfigApplyTemplateBody](tenantconfigapplytemplatebody.md))

# TenantConfigApplyTemplateBody Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                                         |
| :---------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [preset](#preset) | `string` | Required | cannot be null | [TenantConfigApplyTemplateBody](tenantconfigapplytemplatebody-properties-preset.md "undefined#/properties/preset") |
| [reason](#reason) | `string` | Optional | cannot be null | [TenantConfigApplyTemplateBody](tenantconfigapplytemplatebody-properties-reason.md "undefined#/properties/reason") |

## preset



`preset`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantConfigApplyTemplateBody](tenantconfigapplytemplatebody-properties-preset.md "undefined#/properties/preset")

### preset Type

`string`

## reason



`reason`

* is optional

* Type: `string`

* cannot be null

* defined in: [TenantConfigApplyTemplateBody](tenantconfigapplytemplatebody-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`

### reason Constraints

**maximum length**: the maximum number of characters for this string is: `500`
