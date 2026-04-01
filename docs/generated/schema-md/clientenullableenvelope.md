# ClienteNullableEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteNullableEnvelope.schema.json](../schema-json/ClienteNullableEnvelope.schema.json "open original schema") |

## ClienteNullableEnvelope Type

`object` ([ClienteNullableEnvelope](clientenullableenvelope.md))

# ClienteNullableEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [ClienteNullableEnvelope](clientenullableenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteNullableEnvelope](clientenullableenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](clientenullableenvelope-properties-data.md))

* cannot be null

* defined in: [ClienteNullableEnvelope](clientenullableenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](clientenullableenvelope-properties-data.md))

any of

* [Cliente](cliente.md "check type definition")

* [Untitled null in ClienteNullableEnvelope](clientenullableenvelope-properties-data-anyof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteNullableEnvelope](clientenullableenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
