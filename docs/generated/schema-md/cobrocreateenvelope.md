# CobroCreateEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroCreateEnvelope.schema.json](../schema-json/CobroCreateEnvelope.schema.json "open original schema") |

## CobroCreateEnvelope Type

`object` ([CobroCreateEnvelope](cobrocreateenvelope.md))

# CobroCreateEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CobroCreateEnvelope](cobrocreatedata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [CobroCreateEnvelope](cobrocreateenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([CobroCreateData](cobrocreatedata.md))

* cannot be null

* defined in: [CobroCreateEnvelope](cobrocreatedata.md "undefined#/properties/data")

### data Type

`object` ([CobroCreateData](cobrocreatedata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CobroCreateEnvelope](cobrocreateenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
