# LoteSerialEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteSerialEnvelope.schema.json](../schema-json/LoteSerialEnvelope.schema.json "open original schema") |

## LoteSerialEnvelope Type

`object` ([LoteSerialEnvelope](loteserialenvelope.md))

# LoteSerialEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LoteSerialEnvelope](loteserialenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LoteSerialEnvelope](loteserialenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](loteserialenvelope-properties-data.md))

* cannot be null

* defined in: [LoteSerialEnvelope](loteserialenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](loteserialenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoteSerialEnvelope](loteserialenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
