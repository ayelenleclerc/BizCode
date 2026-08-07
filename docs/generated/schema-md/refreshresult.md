# RefreshResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RefreshResult.schema.json](../schema-json/RefreshResult.schema.json "open original schema") |

## RefreshResult Type

`object` ([RefreshResult](refreshresult.md))

# RefreshResult Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                     |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [accessToken](#accesstoken)   | `string`  | Required | cannot be null | [RefreshResult](refreshresult-properties-accesstoken.md "undefined#/properties/accessToken")   |
| [expiresIn](#expiresin)       | `integer` | Required | cannot be null | [RefreshResult](refreshresult-properties-expiresin.md "undefined#/properties/expiresIn")       |
| [refreshToken](#refreshtoken) | `string`  | Required | cannot be null | [RefreshResult](refreshresult-properties-refreshtoken.md "undefined#/properties/refreshToken") |
| [refreshed](#refreshed)       | `boolean` | Required | cannot be null | [RefreshResult](refreshresult-properties-refreshed.md "undefined#/properties/refreshed")       |

## accessToken

New opaque access token (also set as bizcode\_session cookie)

`accessToken`

* is required

* Type: `string`

* cannot be null

* defined in: [RefreshResult](refreshresult-properties-accesstoken.md "undefined#/properties/accessToken")

### accessToken Type

`string`

## expiresIn

Access token lifetime in seconds (900 = 15 minutes)

`expiresIn`

* is required

* Type: `integer`

* cannot be null

* defined in: [RefreshResult](refreshresult-properties-expiresin.md "undefined#/properties/expiresIn")

### expiresIn Type

`integer`

## refreshToken

New opaque refresh token (also set as bizcode\_refresh cookie)

`refreshToken`

* is required

* Type: `string`

* cannot be null

* defined in: [RefreshResult](refreshresult-properties-refreshtoken.md "undefined#/properties/refreshToken")

### refreshToken Type

`string`

## refreshed



`refreshed`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RefreshResult](refreshresult-properties-refreshed.md "undefined#/properties/refreshed")

### refreshed Type

`boolean`

### refreshed Constraints

**constant**: the value of this property must be equal to:

```json
true
```
