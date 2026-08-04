# MeliOrden Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliOrdenListEnvelope.schema.json\*](../schema-json/MeliOrdenListEnvelope.schema.json "open original schema") |

## items Type

`object` ([MeliOrden](meliorden.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [buyerNickname](#buyernickname)   | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-buyernickname.md "undefined#/properties/buyerNickname")   |
| [clienteCuit](#clientecuit)       | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-clientecuit.md "undefined#/properties/clienteCuit")       |
| [clienteId](#clienteid)           | `integer` | Optional | cannot be null | [MeliOrden](meliorden-properties-clienteid.md "undefined#/properties/clienteId")           |
| [clienteRsocial](#clientersocial) | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-clientersocial.md "undefined#/properties/clienteRsocial") |
| [cuitPending](#cuitpending)       | `boolean` | Required | cannot be null | [MeliOrden](meliorden-properties-cuitpending.md "undefined#/properties/cuitPending")       |
| [facturaId](#facturaid)           | `integer` | Optional | cannot be null | [MeliOrden](meliorden-properties-facturaid.md "undefined#/properties/facturaId")           |
| [id](#id)                         | `integer` | Required | cannot be null | [MeliOrden](meliorden-properties-id.md "undefined#/properties/id")                         |
| [isFulfillment](#isfulfillment)   | `boolean` | Required | cannot be null | [MeliOrden](meliorden-properties-isfulfillment.md "undefined#/properties/isFulfillment")   |
| [lastSyncedAt](#lastsyncedat)     | `string`  | Required | cannot be null | [MeliOrden](meliorden-properties-lastsyncedat.md "undefined#/properties/lastSyncedAt")     |
| [meliOrderId](#meliorderid)       | `string`  | Required | cannot be null | [MeliOrden](meliorden-properties-meliorderid.md "undefined#/properties/meliOrderId")       |
| [pedidoEstado](#pedidoestado)     | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-pedidoestado.md "undefined#/properties/pedidoEstado")     |
| [pedidoId](#pedidoid)             | `integer` | Optional | cannot be null | [MeliOrden](meliorden-properties-pedidoid.md "undefined#/properties/pedidoId")             |
| [pedidoTotal](#pedidototal)       | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-pedidototal.md "undefined#/properties/pedidoTotal")       |
| [shippingId](#shippingid)         | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-shippingid.md "undefined#/properties/shippingId")         |
| [status](#status)                 | `string`  | Required | cannot be null | [MeliOrden](meliorden-properties-status.md "undefined#/properties/status")                 |
| [stockAppliedAt](#stockappliedat) | `string`  | Optional | cannot be null | [MeliOrden](meliorden-properties-stockappliedat.md "undefined#/properties/stockAppliedAt") |

## buyerNickname



`buyerNickname`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-buyernickname.md "undefined#/properties/buyerNickname")

### buyerNickname Type

`string`

## clienteCuit



`clienteCuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-clientecuit.md "undefined#/properties/clienteCuit")

### clienteCuit Type

`string`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## clienteRsocial



`clienteRsocial`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-clientersocial.md "undefined#/properties/clienteRsocial")

### clienteRsocial Type

`string`

## cuitPending



`cuitPending`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-cuitpending.md "undefined#/properties/cuitPending")

### cuitPending Type

`boolean`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## isFulfillment



`isFulfillment`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-isfulfillment.md "undefined#/properties/isFulfillment")

### isFulfillment Type

`boolean`

## lastSyncedAt



`lastSyncedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-lastsyncedat.md "undefined#/properties/lastSyncedAt")

### lastSyncedAt Type

`string`

### lastSyncedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## meliOrderId



`meliOrderId`

* is required

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-meliorderid.md "undefined#/properties/meliOrderId")

### meliOrderId Type

`string`

## pedidoEstado



`pedidoEstado`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-pedidoestado.md "undefined#/properties/pedidoEstado")

### pedidoEstado Type

`string`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## pedidoTotal



`pedidoTotal`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-pedidototal.md "undefined#/properties/pedidoTotal")

### pedidoTotal Type

`string`

## shippingId



`shippingId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-shippingid.md "undefined#/properties/shippingId")

### shippingId Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-status.md "undefined#/properties/status")

### status Type

`string`

## stockAppliedAt



`stockAppliedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliOrden](meliorden-properties-stockappliedat.md "undefined#/properties/stockAppliedAt")

### stockAppliedAt Type

`string`

### stockAppliedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
