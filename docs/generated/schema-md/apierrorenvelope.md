# ApiErrorEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ApiErrorEnvelope.schema.json](../schema-json/ApiErrorEnvelope.schema.json "open original schema") |

## ApiErrorEnvelope Type

`object` ([ApiErrorEnvelope](apierrorenvelope.md))

# ApiErrorEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [error](#error)     | `string`  | Required | cannot be null | [ApiErrorEnvelope](apierrorenvelope-properties-error.md "undefined#/properties/error")     |
| [success](#success) | `boolean` | Required | cannot be null | [ApiErrorEnvelope](apierrorenvelope-properties-success.md "undefined#/properties/success") |

## error



`error`

* is required

* Type: `string`

* cannot be null

* defined in: [ApiErrorEnvelope](apierrorenvelope-properties-error.md "undefined#/properties/error")

### error Type

`string`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ApiErrorEnvelope](apierrorenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
false
```
