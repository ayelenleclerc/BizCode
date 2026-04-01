# ClienteListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteListEnvelope.schema.json](../schema-json/ClienteListEnvelope.schema.json "open original schema") |

## ClienteListEnvelope Type

`object` ([ClienteListEnvelope](clientelistenvelope.md))

# ClienteListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ClienteListEnvelope](clientelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteListEnvelope](clientelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Cliente](cliente.md))

* cannot be null

* defined in: [ClienteListEnvelope](clientelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Cliente](cliente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteListEnvelope](clientelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
