# PlantillaPedidoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PlantillaPedidoEnvelope.schema.json](../schema-json/PlantillaPedidoEnvelope.schema.json "open original schema") |

## PlantillaPedidoEnvelope Type

`object` ([PlantillaPedidoEnvelope](plantillapedidoenvelope.md))

# PlantillaPedidoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PlantillaPedidoEnvelope](plantillapedido.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PlantillaPedidoEnvelope](plantillapedidoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PlantillaPedido](plantillapedido.md))

* cannot be null

* defined in: [PlantillaPedidoEnvelope](plantillapedido.md "undefined#/properties/data")

### data Type

`object` ([PlantillaPedido](plantillapedido.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PlantillaPedidoEnvelope](plantillapedidoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
