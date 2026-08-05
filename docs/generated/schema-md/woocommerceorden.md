# WooCommerceOrden Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WooCommerceOrdenListEnvelope.schema.json\*](../schema-json/WooCommerceOrdenListEnvelope.schema.json "open original schema") |

## items Type

`object` ([WooCommerceOrden](woocommerceorden.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                               |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [buyerNickname](#buyernickname)   | `string`  | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-buyernickname.md "undefined#/properties/buyerNickname")   |
| [clienteCuit](#clientecuit)       | `string`  | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-clientecuit.md "undefined#/properties/clienteCuit")       |
| [clienteId](#clienteid)           | `integer` | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-clienteid.md "undefined#/properties/clienteId")           |
| [clienteRsocial](#clientersocial) | `string`  | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-clientersocial.md "undefined#/properties/clienteRsocial") |
| [cuitPending](#cuitpending)       | `boolean` | Required | cannot be null | [WooCommerceOrden](woocommerceorden-properties-cuitpending.md "undefined#/properties/cuitPending")       |
| [facturaId](#facturaid)           | `integer` | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-facturaid.md "undefined#/properties/facturaId")           |
| [id](#id)                         | `integer` | Required | cannot be null | [WooCommerceOrden](woocommerceorden-properties-id.md "undefined#/properties/id")                         |
| [lastSyncedAt](#lastsyncedat)     | `string`  | Required | cannot be null | [WooCommerceOrden](woocommerceorden-properties-lastsyncedat.md "undefined#/properties/lastSyncedAt")     |
| [pedidoEstado](#pedidoestado)     | `string`  | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-pedidoestado.md "undefined#/properties/pedidoEstado")     |
| [pedidoId](#pedidoid)             | `integer` | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-pedidoid.md "undefined#/properties/pedidoId")             |
| [pedidoTotal](#pedidototal)       | `string`  | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-pedidototal.md "undefined#/properties/pedidoTotal")       |
| [status](#status)                 | `string`  | Required | cannot be null | [WooCommerceOrden](woocommerceorden-properties-status.md "undefined#/properties/status")                 |
| [stockAppliedAt](#stockappliedat) | `string`  | Optional | cannot be null | [WooCommerceOrden](woocommerceorden-properties-stockappliedat.md "undefined#/properties/stockAppliedAt") |
| [wcOrderId](#wcorderid)           | `string`  | Required | cannot be null | [WooCommerceOrden](woocommerceorden-properties-wcorderid.md "undefined#/properties/wcOrderId")           |

## buyerNickname



`buyerNickname`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-buyernickname.md "undefined#/properties/buyerNickname")

### buyerNickname Type

`string`

## clienteCuit



`clienteCuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-clientecuit.md "undefined#/properties/clienteCuit")

### clienteCuit Type

`string`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## clienteRsocial



`clienteRsocial`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-clientersocial.md "undefined#/properties/clienteRsocial")

### clienteRsocial Type

`string`

## cuitPending



`cuitPending`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-cuitpending.md "undefined#/properties/cuitPending")

### cuitPending Type

`boolean`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## lastSyncedAt



`lastSyncedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-lastsyncedat.md "undefined#/properties/lastSyncedAt")

### lastSyncedAt Type

`string`

### lastSyncedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## pedidoEstado



`pedidoEstado`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-pedidoestado.md "undefined#/properties/pedidoEstado")

### pedidoEstado Type

`string`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## pedidoTotal



`pedidoTotal`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-pedidototal.md "undefined#/properties/pedidoTotal")

### pedidoTotal Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-status.md "undefined#/properties/status")

### status Type

`string`

## stockAppliedAt



`stockAppliedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-stockappliedat.md "undefined#/properties/stockAppliedAt")

### stockAppliedAt Type

`string`

### stockAppliedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## wcOrderId



`wcOrderId`

* is required

* Type: `string`

* cannot be null

* defined in: [WooCommerceOrden](woocommerceorden-properties-wcorderid.md "undefined#/properties/wcOrderId")

### wcOrderId Type

`string`
