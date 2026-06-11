# PortalPedidoRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalPedidoRow.schema.json](../schema-json/PortalPedidoRow.schema.json "open original schema") |

## PortalPedidoRow Type

`object` ([PortalPedidoRow](portalpedidorow.md))

# PortalPedidoRow Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                         |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)       | `string`  | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-createdat.md "undefined#/properties/createdAt")       |
| [estado](#estado)             | `string`  | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-estado.md "undefined#/properties/estado")             |
| [facturaRef](#facturaref)     | `string`  | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-facturaref.md "undefined#/properties/facturaRef")     |
| [id](#id)                     | `integer` | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-id.md "undefined#/properties/id")                     |
| [remitoEstado](#remitoestado) | `string`  | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-remitoestado.md "undefined#/properties/remitoEstado") |
| [total](#total)               | `string`  | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-total.md "undefined#/properties/total")               |
| [validUntil](#validuntil)     | `string`  | Required | cannot be null | [PortalPedidoRow](portalpedidorow-properties-validuntil.md "undefined#/properties/validUntil")     |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## facturaRef



`facturaRef`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-facturaref.md "undefined#/properties/facturaRef")

### facturaRef Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## remitoEstado



`remitoEstado`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-remitoestado.md "undefined#/properties/remitoEstado")

### remitoEstado Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-total.md "undefined#/properties/total")

### total Type

`string`

## validUntil



`validUntil`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalPedidoRow](portalpedidorow-properties-validuntil.md "undefined#/properties/validUntil")

### validUntil Type

`string`

### validUntil Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
