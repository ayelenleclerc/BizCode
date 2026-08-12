# PedidoPrefillEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoPrefillEnvelope.schema.json](../schema-json/PedidoPrefillEnvelope.schema.json "open original schema") |

## PedidoPrefillEnvelope Type

`object` ([PedidoPrefillEnvelope](pedidoprefillenvelope.md))

# PedidoPrefillEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PedidoPrefillEnvelope](pedidoprefill.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PedidoPrefillEnvelope](pedidoprefillenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PedidoPrefill](pedidoprefill.md))

* cannot be null

* defined in: [PedidoPrefillEnvelope](pedidoprefill.md "undefined#/properties/data")

### data Type

`object` ([PedidoPrefill](pedidoprefill.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PedidoPrefillEnvelope](pedidoprefillenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
