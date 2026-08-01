# MeliAuthorizeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliAuthorizeEnvelope.schema.json](../schema-json/MeliAuthorizeEnvelope.schema.json "open original schema") |

## MeliAuthorizeEnvelope Type

`object` ([MeliAuthorizeEnvelope](meliauthorizeenvelope.md))

# MeliAuthorizeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MeliAuthorizeEnvelope](meliauthorizeenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MeliAuthorizeEnvelope](meliauthorizeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](meliauthorizeenvelope-properties-data.md))

* cannot be null

* defined in: [MeliAuthorizeEnvelope](meliauthorizeenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](meliauthorizeenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliAuthorizeEnvelope](meliauthorizeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
