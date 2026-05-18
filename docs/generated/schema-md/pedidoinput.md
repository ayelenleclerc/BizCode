# PedidoInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoInput.schema.json](../schema-json/PedidoInput.schema.json "open original schema") |

## PedidoInput Type

`object` ([PedidoInput](pedidoinput.md))

# PedidoInput Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)   | `integer` | Required | cannot be null | [PedidoInput](pedidoinput-properties-clienteid.md "undefined#/properties/clienteId")   |
| [items](#items)           | `array`   | Required | cannot be null | [PedidoInput](pedidoinput-properties-items.md "undefined#/properties/items")           |
| [validUntil](#validuntil) | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-validuntil.md "undefined#/properties/validUntil") |
| [vendedorId](#vendedorid) | `integer` | Optional | cannot be null | [PedidoInput](pedidoinput-properties-vendedorid.md "undefined#/properties/vendedorId") |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## items



`items`

* is required

* Type: `object[]` ([Details](pedidoinput-properties-items-items.md))

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](pedidoinput-properties-items-items.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## validUntil



`validUntil`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-validuntil.md "undefined#/properties/validUntil")

### validUntil Type

`string`

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`
