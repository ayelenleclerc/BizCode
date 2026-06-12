# Untitled object in PortalPedidoListEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalPedidoListEnvelope.schema.json\*](../schema-json/PortalPedidoListEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](portalpedidolistenvelope-properties-data.md))

# data Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| [pedidos](#pedidos) | `array`   | Required | cannot be null | [PortalPedidoListEnvelope](portalpedidolistenvelope-properties-data-properties-pedidos.md "undefined#/properties/data/properties/pedidos") |
| [total](#total)     | `integer` | Required | cannot be null | [PortalPedidoListEnvelope](portalpedidolistenvelope-properties-data-properties-total.md "undefined#/properties/data/properties/total")     |

## pedidos



`pedidos`

* is required

* Type: `object[]` ([PortalPedidoRow](portalpedidorow.md))

* cannot be null

* defined in: [PortalPedidoListEnvelope](portalpedidolistenvelope-properties-data-properties-pedidos.md "undefined#/properties/data/properties/pedidos")

### pedidos Type

`object[]` ([PortalPedidoRow](portalpedidorow.md))

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [PortalPedidoListEnvelope](portalpedidolistenvelope-properties-data-properties-total.md "undefined#/properties/data/properties/total")

### total Type

`integer`
