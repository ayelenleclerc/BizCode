# NotaCreditoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [NotaCreditoEnvelope.schema.json](../schema-json/NotaCreditoEnvelope.schema.json "open original schema") |

## NotaCreditoEnvelope Type

`object` ([NotaCreditoEnvelope](notacreditoenvelope.md))

# NotaCreditoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [NotaCreditoEnvelope](notacreditodetail.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [NotaCreditoEnvelope](notacreditoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([NotaCreditoDetail](notacreditodetail.md))

* cannot be null

* defined in: [NotaCreditoEnvelope](notacreditodetail.md "undefined#/properties/data")

### data Type

`object` ([NotaCreditoDetail](notacreditodetail.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [NotaCreditoEnvelope](notacreditoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
