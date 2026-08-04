# TiendanubeOrden Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TiendanubeOrdenListEnvelope.schema.json\*](../schema-json/TiendanubeOrdenListEnvelope.schema.json "open original schema") |

## items Type

`object` ([TiendanubeOrden](tiendanubeorden.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                             |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [buyerNickname](#buyernickname)   | `string`  | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-buyernickname.md "undefined#/properties/buyerNickname")   |
| [clienteCuit](#clientecuit)       | `string`  | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-clientecuit.md "undefined#/properties/clienteCuit")       |
| [clienteId](#clienteid)           | `integer` | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-clienteid.md "undefined#/properties/clienteId")           |
| [clienteRsocial](#clientersocial) | `string`  | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-clientersocial.md "undefined#/properties/clienteRsocial") |
| [cuitPending](#cuitpending)       | `boolean` | Required | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-cuitpending.md "undefined#/properties/cuitPending")       |
| [facturaId](#facturaid)           | `integer` | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-facturaid.md "undefined#/properties/facturaId")           |
| [id](#id)                         | `integer` | Required | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-id.md "undefined#/properties/id")                         |
| [lastSyncedAt](#lastsyncedat)     | `string`  | Required | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-lastsyncedat.md "undefined#/properties/lastSyncedAt")     |
| [pedidoEstado](#pedidoestado)     | `string`  | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-pedidoestado.md "undefined#/properties/pedidoEstado")     |
| [pedidoId](#pedidoid)             | `integer` | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-pedidoid.md "undefined#/properties/pedidoId")             |
| [pedidoTotal](#pedidototal)       | `string`  | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-pedidototal.md "undefined#/properties/pedidoTotal")       |
| [status](#status)                 | `string`  | Required | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-status.md "undefined#/properties/status")                 |
| [stockAppliedAt](#stockappliedat) | `string`  | Optional | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-stockappliedat.md "undefined#/properties/stockAppliedAt") |
| [tnOrderId](#tnorderid)           | `string`  | Required | cannot be null | [TiendanubeOrden](tiendanubeorden-properties-tnorderid.md "undefined#/properties/tnOrderId")           |

## buyerNickname



`buyerNickname`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-buyernickname.md "undefined#/properties/buyerNickname")

### buyerNickname Type

`string`

## clienteCuit



`clienteCuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-clientecuit.md "undefined#/properties/clienteCuit")

### clienteCuit Type

`string`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## clienteRsocial



`clienteRsocial`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-clientersocial.md "undefined#/properties/clienteRsocial")

### clienteRsocial Type

`string`

## cuitPending



`cuitPending`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-cuitpending.md "undefined#/properties/cuitPending")

### cuitPending Type

`boolean`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## lastSyncedAt



`lastSyncedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-lastsyncedat.md "undefined#/properties/lastSyncedAt")

### lastSyncedAt Type

`string`

### lastSyncedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## pedidoEstado



`pedidoEstado`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-pedidoestado.md "undefined#/properties/pedidoEstado")

### pedidoEstado Type

`string`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## pedidoTotal



`pedidoTotal`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-pedidototal.md "undefined#/properties/pedidoTotal")

### pedidoTotal Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-status.md "undefined#/properties/status")

### status Type

`string`

## stockAppliedAt



`stockAppliedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-stockappliedat.md "undefined#/properties/stockAppliedAt")

### stockAppliedAt Type

`string`

### stockAppliedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## tnOrderId



`tnOrderId`

* is required

* Type: `string`

* cannot be null

* defined in: [TiendanubeOrden](tiendanubeorden-properties-tnorderid.md "undefined#/properties/tnOrderId")

### tnOrderId Type

`string`
