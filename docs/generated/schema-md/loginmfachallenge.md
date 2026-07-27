# LoginMfaChallenge Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoginMfaChallenge.schema.json](../schema-json/LoginMfaChallenge.schema.json "open original schema") |

## LoginMfaChallenge Type

`object` ([LoginMfaChallenge](loginmfachallenge.md))

# LoginMfaChallenge Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [mfaRequired](#mfarequired) | `boolean` | Required | cannot be null | [LoginMfaChallenge](loginmfachallenge-properties-mfarequired.md "undefined#/properties/mfaRequired") |
| [mfaToken](#mfatoken)       | `string`  | Required | cannot be null | [LoginMfaChallenge](loginmfachallenge-properties-mfatoken.md "undefined#/properties/mfaToken")       |

## mfaRequired



`mfaRequired`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoginMfaChallenge](loginmfachallenge-properties-mfarequired.md "undefined#/properties/mfaRequired")

### mfaRequired Type

`boolean`

### mfaRequired Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## mfaToken

Opaque single-use challenge token (TTL 5 minutes, Redis)

`mfaToken`

* is required

* Type: `string`

* cannot be null

* defined in: [LoginMfaChallenge](loginmfachallenge-properties-mfatoken.md "undefined#/properties/mfaToken")

### mfaToken Type

`string`
