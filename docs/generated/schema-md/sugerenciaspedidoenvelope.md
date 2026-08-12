# SugerenciasPedidoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SugerenciasPedidoEnvelope.schema.json](../schema-json/SugerenciasPedidoEnvelope.schema.json "open original schema") |

## SugerenciasPedidoEnvelope Type

`object` ([SugerenciasPedidoEnvelope](sugerenciaspedidoenvelope.md))

# SugerenciasPedidoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SugerenciasPedidoEnvelope](sugerenciaspedido.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [SugerenciasPedidoEnvelope](sugerenciaspedidoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SugerenciasPedido](sugerenciaspedido.md))

* cannot be null

* defined in: [SugerenciasPedidoEnvelope](sugerenciaspedido.md "undefined#/properties/data")

### data Type

`object` ([SugerenciasPedido](sugerenciaspedido.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SugerenciasPedidoEnvelope](sugerenciaspedidoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
