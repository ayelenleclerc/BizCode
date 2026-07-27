# AuthClaims Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AuthClaimsEnvelope.schema.json\*](../schema-json/AuthClaimsEnvelope.schema.json "open original schema") |

## data Type

`object` ([AuthClaims](authclaims.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [mfaEnabled](#mfaenabled)             | `boolean` | Required | cannot be null | [AuthClaims](authclaims-properties-mfaenabled.md "undefined#/properties/mfaEnabled")             |
| [mfaSetupRequired](#mfasetuprequired) | `boolean` | Required | cannot be null | [AuthClaims](authclaims-properties-mfasetuprequired.md "undefined#/properties/mfaSetupRequired") |
| [permissions](#permissions)           | `array`   | Required | cannot be null | [AuthClaims](authclaims-properties-permissions.md "undefined#/properties/permissions")           |
| [role](#role)                         | `string`  | Required | cannot be null | [AuthClaims](authclaims-properties-role.md "undefined#/properties/role")                         |
| [scope](#scope)                       | `object`  | Required | cannot be null | [AuthClaims](authscope.md "undefined#/properties/scope")                                         |
| [tenantId](#tenantid)                 | `integer` | Required | cannot be null | [AuthClaims](authclaims-properties-tenantid.md "undefined#/properties/tenantId")                 |
| [userId](#userid)                     | `integer` | Required | cannot be null | [AuthClaims](authclaims-properties-userid.md "undefined#/properties/userId")                     |
| [username](#username)                 | `string`  | Required | cannot be null | [AuthClaims](authclaims-properties-username.md "undefined#/properties/username")                 |

## mfaEnabled



`mfaEnabled`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-mfaenabled.md "undefined#/properties/mfaEnabled")

### mfaEnabled Type

`boolean`

## mfaSetupRequired

True when role requires MFA and MFA is not yet enabled (#213)

`mfaSetupRequired`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-mfasetuprequired.md "undefined#/properties/mfaSetupRequired")

### mfaSetupRequired Type

`boolean`

## permissions



`permissions`

* is required

* Type: `string[]`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-permissions.md "undefined#/properties/permissions")

### permissions Type

`string[]`

## role



`role`

* is required

* Type: `string`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-role.md "undefined#/properties/role")

### role Type

`string`

## scope



`scope`

* is required

* Type: `object` ([AuthScope](authscope.md))

* cannot be null

* defined in: [AuthClaims](authscope.md "undefined#/properties/scope")

### scope Type

`object` ([AuthScope](authscope.md))

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## userId



`userId`

* is required

* Type: `integer`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`

## username



`username`

* is required

* Type: `string`

* cannot be null

* defined in: [AuthClaims](authclaims-properties-username.md "undefined#/properties/username")

### username Type

`string`
