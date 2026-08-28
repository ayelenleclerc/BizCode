# IncotermsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [IncotermsEnvelope.schema.json](../schema-json/IncotermsEnvelope.schema.json "open original schema") |

## IncotermsEnvelope Type

`object` ([IncotermsEnvelope](incotermsenvelope.md))

# IncotermsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [IncotermsEnvelope](incotermsenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [IncotermsEnvelope](incotermsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `string[]` ([Incoterm](incoterm.md))

* cannot be null

* defined in: [IncotermsEnvelope](incotermsenvelope-properties-data.md "undefined#/properties/data")

### data Type

`string[]` ([Incoterm](incoterm.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [IncotermsEnvelope](incotermsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
