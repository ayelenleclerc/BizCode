# LoginResult Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoginSuccessEnvelope.schema.json\*](../schema-json/LoginSuccessEnvelope.schema.json "open original schema") |

## data Type

`object` ([LoginResult](loginresult.md))

# data Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                 |
| :---------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [accessToken](#accesstoken)   | `string`  | Required | cannot be null | [LoginResult](loginresult-properties-accesstoken.md "undefined#/properties/accessToken")   |
| [expiresIn](#expiresin)       | `integer` | Required | cannot be null | [LoginResult](loginresult-properties-expiresin.md "undefined#/properties/expiresIn")       |
| [refreshToken](#refreshtoken) | `string`  | Required | cannot be null | [LoginResult](loginresult-properties-refreshtoken.md "undefined#/properties/refreshToken") |
| [role](#role)                 | `string`  | Required | cannot be null | [LoginResult](loginresult-properties-role.md "undefined#/properties/role")                 |
| [tenantId](#tenantid)         | `integer` | Required | cannot be null | [LoginResult](loginresult-properties-tenantid.md "undefined#/properties/tenantId")         |
| [userId](#userid)             | `integer` | Required | cannot be null | [LoginResult](loginresult-properties-userid.md "undefined#/properties/userId")             |
| [username](#username)         | `string`  | Required | cannot be null | [LoginResult](loginresult-properties-username.md "undefined#/properties/username")         |

## accessToken

Opaque access token for Authorization Bearer (also HttpOnly cookie)

`accessToken`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginResult](loginresult-properties-accesstoken.md "undefined#/properties/accessToken")

### accessToken Type

`string`

## expiresIn

Access token lifetime in seconds

`expiresIn`

* is required

* Type: `integer`

* cannot be null

* defined in: [LoginResult](loginresult-properties-expiresin.md "undefined#/properties/expiresIn")

### expiresIn Type

`integer`

## refreshToken

Opaque refresh token for rotation (also HttpOnly cookie)

`refreshToken`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginResult](loginresult-properties-refreshtoken.md "undefined#/properties/refreshToken")

### refreshToken Type

`string`

## role



`role`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginResult](loginresult-properties-role.md "undefined#/properties/role")

### role Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LoginResult](loginresult-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## userId



`userId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LoginResult](loginresult-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`

## username



`username`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginResult](loginresult-properties-username.md "undefined#/properties/username")

### username Type

`string`
