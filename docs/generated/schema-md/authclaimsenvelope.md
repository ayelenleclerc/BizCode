# AuthClaimsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AuthClaimsEnvelope.schema.json](../schema-json/AuthClaimsEnvelope.schema.json "open original schema") |

## AuthClaimsEnvelope Type

`object` ([AuthClaimsEnvelope](authclaimsenvelope.md))

# AuthClaimsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [AuthClaimsEnvelope](authclaims.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [AuthClaimsEnvelope](authclaimsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([AuthClaims](authclaims.md))

* cannot be null

* defined in: [AuthClaimsEnvelope](authclaims.md "undefined#/properties/data")

### data Type

`object` ([AuthClaims](authclaims.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AuthClaimsEnvelope](authclaimsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
