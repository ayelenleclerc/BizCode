# TenantPlanChangeBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantPlanChangeBody.schema.json](../schema-json/TenantPlanChangeBody.schema.json "open original schema") |

## TenantPlanChangeBody Type

`object` ([TenantPlanChangeBody](tenantplanchangebody.md))

# TenantPlanChangeBody Properties

| Property            | Type     | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [planKey](#plankey) | `string` | Required | cannot be null | [TenantPlanChangeBody](tenantplanchangebody-properties-plankey.md "undefined#/properties/planKey") |
| [reason](#reason)   | `string` | Required | cannot be null | [TenantPlanChangeBody](tenantplanchangebody-properties-reason.md "undefined#/properties/reason")   |

## planKey



`planKey`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPlanChangeBody](tenantplanchangebody-properties-plankey.md "undefined#/properties/planKey")

### planKey Type

`string`

### planKey Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"starter"`    |             |
| `"pro"`        |             |
| `"enterprise"` |             |
| `"trial"`      |             |

## reason



`reason`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPlanChangeBody](tenantplanchangebody-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`

### reason Constraints

**maximum length**: the maximum number of characters for this string is: `500`
