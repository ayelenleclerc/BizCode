# SetupOwnerInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SetupOwnerInput.schema.json](../schema-json/SetupOwnerInput.schema.json "open original schema") |

## SetupOwnerInput Type

`object` ([SetupOwnerInput](setupownerinput.md))

# SetupOwnerInput Properties

| Property                  | Type     | Required | Nullable       | Defined by                                                                                     |
| :------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [password](#password)     | `string` | Required | cannot be null | [SetupOwnerInput](setupownerinput-properties-password.md "undefined#/properties/password")     |
| [tenantName](#tenantname) | `string` | Required | cannot be null | [SetupOwnerInput](setupownerinput-properties-tenantname.md "undefined#/properties/tenantName") |
| [tenantSlug](#tenantslug) | `string` | Required | cannot be null | [SetupOwnerInput](setupownerinput-properties-tenantslug.md "undefined#/properties/tenantSlug") |
| [username](#username)     | `string` | Required | cannot be null | [SetupOwnerInput](setupownerinput-properties-username.md "undefined#/properties/username")     |

## password



`password`

* is required

* Type: `string`

* cannot be null

* defined in: [SetupOwnerInput](setupownerinput-properties-password.md "undefined#/properties/password")

### password Type

`string`

### password Constraints

**minimum length**: the minimum number of characters for this string is: `8`

## tenantName



`tenantName`

* is required

* Type: `string`

* cannot be null

* defined in: [SetupOwnerInput](setupownerinput-properties-tenantname.md "undefined#/properties/tenantName")

### tenantName Type

`string`

### tenantName Constraints

**minimum length**: the minimum number of characters for this string is: `2`

## tenantSlug



`tenantSlug`

* is required

* Type: `string`

* cannot be null

* defined in: [SetupOwnerInput](setupownerinput-properties-tenantslug.md "undefined#/properties/tenantSlug")

### tenantSlug Type

`string`

### tenantSlug Constraints

**minimum length**: the minimum number of characters for this string is: `2`

## username



`username`

* is required

* Type: `string`

* cannot be null

* defined in: [SetupOwnerInput](setupownerinput-properties-username.md "undefined#/properties/username")

### username Type

`string`

### username Constraints

**minimum length**: the minimum number of characters for this string is: `3`
