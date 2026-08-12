# PlantillaPedidoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PlantillaPedidoListEnvelope.schema.json](../schema-json/PlantillaPedidoListEnvelope.schema.json "open original schema") |

## PlantillaPedidoListEnvelope Type

`object` ([PlantillaPedidoListEnvelope](plantillapedidolistenvelope.md))

# PlantillaPedidoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [PlantillaPedidoListEnvelope](plantillapedidolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PlantillaPedidoListEnvelope](plantillapedidolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([PlantillaPedido](plantillapedido.md))

* cannot be null

* defined in: [PlantillaPedidoListEnvelope](plantillapedidolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([PlantillaPedido](plantillapedido.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PlantillaPedidoListEnvelope](plantillapedidolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
