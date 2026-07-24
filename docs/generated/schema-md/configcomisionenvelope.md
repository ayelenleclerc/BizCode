# ConfigComisionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigComisionEnvelope.schema.json](../schema-json/ConfigComisionEnvelope.schema.json "open original schema") |

## ConfigComisionEnvelope Type

`object` ([ConfigComisionEnvelope](configcomisionenvelope.md))

# ConfigComisionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ConfigComisionEnvelope](configcomision.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ConfigComisionEnvelope](configcomisionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ConfigComision](configcomision.md))

* cannot be null

* defined in: [ConfigComisionEnvelope](configcomision.md "undefined#/properties/data")

### data Type

`object` ([ConfigComision](configcomision.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConfigComisionEnvelope](configcomisionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
