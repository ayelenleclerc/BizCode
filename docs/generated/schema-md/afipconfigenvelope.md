# AfipConfigEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AfipConfigEnvelope.schema.json](../schema-json/AfipConfigEnvelope.schema.json "open original schema") |

## AfipConfigEnvelope Type

`object` ([AfipConfigEnvelope](afipconfigenvelope.md))

# AfipConfigEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [AfipConfigEnvelope](afipconfigenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [AfipConfigEnvelope](afipconfigenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](afipconfigenvelope-properties-data.md))

* cannot be null

* defined in: [AfipConfigEnvelope](afipconfigenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](afipconfigenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AfipConfigEnvelope](afipconfigenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
