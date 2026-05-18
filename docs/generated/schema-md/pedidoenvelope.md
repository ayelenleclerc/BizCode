# PedidoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoEnvelope.schema.json](../schema-json/PedidoEnvelope.schema.json "open original schema") |

## PedidoEnvelope Type

`object` ([PedidoEnvelope](pedidoenvelope.md))

# PedidoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PedidoEnvelope](pedido.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PedidoEnvelope](pedidoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Pedido](pedido.md))

* cannot be null

* defined in: [PedidoEnvelope](pedido.md "undefined#/properties/data")

### data Type

`object` ([Pedido](pedido.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PedidoEnvelope](pedidoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
