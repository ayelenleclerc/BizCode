# SuperadminTenantCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminTenantCreateInput.schema.json](../schema-json/SuperadminTenantCreateInput.schema.json "open original schema") |

## SuperadminTenantCreateInput Type

`object` ([SuperadminTenantCreateInput](superadmintenantcreateinput.md))

# SuperadminTenantCreateInput Properties

| Property                        | Type     | Required | Nullable       | Defined by                                                                                                                   |
| :------------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [name](#name)                   | `string` | Required | cannot be null | [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-name.md "undefined#/properties/name")                   |
| [ownerPassword](#ownerpassword) | `string` | Optional | cannot be null | [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-ownerpassword.md "undefined#/properties/ownerPassword") |
| [ownerUsername](#ownerusername) | `string` | Optional | cannot be null | [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-ownerusername.md "undefined#/properties/ownerUsername") |
| [plan](#plan)                   | `string` | Optional | cannot be null | [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-plan.md "undefined#/properties/plan")                   |
| [slug](#slug)                   | `string` | Required | cannot be null | [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-slug.md "undefined#/properties/slug")                   |

## name



`name`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-name.md "undefined#/properties/name")

### name Type

`string`

### name Constraints

**minimum length**: the minimum number of characters for this string is: `1`

## ownerPassword



`ownerPassword`

* is optional

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-ownerpassword.md "undefined#/properties/ownerPassword")

### ownerPassword Type

`string`

### ownerPassword Constraints

**unknown format**: the value of this string must follow the format: `password`

## ownerUsername



`ownerUsername`

* is optional

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-ownerusername.md "undefined#/properties/ownerUsername")

### ownerUsername Type

`string`

## plan



`plan`

* is optional

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

### plan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"starter"`    |             |
| `"pro"`        |             |
| `"enterprise"` |             |

## slug



`slug`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantCreateInput](superadmintenantcreateinput-properties-slug.md "undefined#/properties/slug")

### slug Type

`string`

### slug Constraints

**minimum length**: the minimum number of characters for this string is: `1`
