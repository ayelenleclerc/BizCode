# Pedido Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoListEnvelope.schema.json\*](../schema-json/PedidoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Pedido](pedido.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                   |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------- |
| [clienteId](#clienteid)   | `integer` | Optional | cannot be null | [Pedido](pedido-properties-clienteid.md "undefined#/properties/clienteId")   |
| [createdAt](#createdat)   | `string`  | Optional | cannot be null | [Pedido](pedido-properties-createdat.md "undefined#/properties/createdAt")   |
| [estado](#estado)         | `string`  | Optional | cannot be null | [Pedido](pedido-properties-estado.md "undefined#/properties/estado")         |
| [facturaId](#facturaid)   | `integer` | Optional | cannot be null | [Pedido](pedido-properties-facturaid.md "undefined#/properties/facturaId")   |
| [id](#id)                 | `integer` | Optional | cannot be null | [Pedido](pedido-properties-id.md "undefined#/properties/id")                 |
| [items](#items)           | `array`   | Optional | cannot be null | [Pedido](pedido-properties-items.md "undefined#/properties/items")           |
| [tenantId](#tenantid)     | `integer` | Optional | cannot be null | [Pedido](pedido-properties-tenantid.md "undefined#/properties/tenantId")     |
| [total](#total)           | `number`  | Optional | cannot be null | [Pedido](pedido-properties-total.md "undefined#/properties/total")           |
| [updatedAt](#updatedat)   | `string`  | Optional | cannot be null | [Pedido](pedido-properties-updatedat.md "undefined#/properties/updatedAt")   |
| [validUntil](#validuntil) | `string`  | Optional | cannot be null | [Pedido](pedido-properties-validuntil.md "undefined#/properties/validUntil") |
| [vendedorId](#vendedorid) | `integer` | Optional | cannot be null | [Pedido](pedido-properties-vendedorid.md "undefined#/properties/vendedorId") |
| Additional Properties     | Any       | Optional | can be null    |                                                                              |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Pedido](pedido-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Pedido](pedido-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [Pedido](pedido-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"draft"`     |             |
| `"confirmed"` |             |
| `"invoiced"`  |             |
| `"cancelled"` |             |

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Pedido](pedido-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Pedido](pedido-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([PedidoItem](pedidoitem.md))

* cannot be null

* defined in: [Pedido](pedido-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([PedidoItem](pedidoitem.md))

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Pedido](pedido-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## total



`total`

* is optional

* Type: `number`

* cannot be null

* defined in: [Pedido](pedido-properties-total.md "undefined#/properties/total")

### total Type

`number`

## updatedAt



`updatedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Pedido](pedido-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## validUntil



`validUntil`

* is optional

* Type: `string`

* cannot be null

* defined in: [Pedido](pedido-properties-validuntil.md "undefined#/properties/validUntil")

### validUntil Type

`string`

### validUntil Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Pedido](pedido-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
