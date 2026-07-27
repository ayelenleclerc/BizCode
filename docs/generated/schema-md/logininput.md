# LoginInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoginInput.schema.json](../schema-json/LoginInput.schema.json "open original schema") |

## LoginInput Type

`object` ([LoginInput](logininput.md))

# LoginInput Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [password](#password)     | `string`  | Required | cannot be null | [LoginInput](logininput-properties-password.md "undefined#/properties/password")     |
| [rememberMe](#rememberme) | `boolean` | Optional | cannot be null | [LoginInput](logininput-properties-rememberme.md "undefined#/properties/rememberMe") |
| [tenantSlug](#tenantslug) | `string`  | Required | cannot be null | [LoginInput](logininput-properties-tenantslug.md "undefined#/properties/tenantSlug") |
| [username](#username)     | `string`  | Required | cannot be null | [LoginInput](logininput-properties-username.md "undefined#/properties/username")     |

## password



`password`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginInput](logininput-properties-password.md "undefined#/properties/password")

### password Type

`string`

## rememberMe

When true, refresh cookie TTL is 30 days; otherwise 7 days (#212).

`rememberMe`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [LoginInput](logininput-properties-rememberme.md "undefined#/properties/rememberMe")

### rememberMe Type

`boolean`

## tenantSlug



`tenantSlug`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginInput](logininput-properties-tenantslug.md "undefined#/properties/tenantSlug")

### tenantSlug Type

`string`

## username



`username`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginInput](logininput-properties-username.md "undefined#/properties/username")

### username Type

`string`
