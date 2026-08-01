# Untitled object in MeliAuthorizeEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliAuthorizeEnvelope.schema.json\*](../schema-json/MeliAuthorizeEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](meliauthorizeenvelope-properties-data.md))

# data Properties

| Property                              | Type     | Required | Nullable       | Defined by                                                                                                                                             |
| :------------------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [authorizationUrl](#authorizationurl) | `string` | Required | cannot be null | [MeliAuthorizeEnvelope](meliauthorizeenvelope-properties-data-properties-authorizationurl.md "undefined#/properties/data/properties/authorizationUrl") |

## authorizationUrl



`authorizationUrl`

* is required

* Type: `string`

* cannot be null

* defined in: [MeliAuthorizeEnvelope](meliauthorizeenvelope-properties-data-properties-authorizationurl.md "undefined#/properties/data/properties/authorizationUrl")

### authorizationUrl Type

`string`

### authorizationUrl Constraints

**URI**: the string must be a URI, according to [RFC 3986](https://tools.ietf.org/html/rfc3986 "check the specification")
