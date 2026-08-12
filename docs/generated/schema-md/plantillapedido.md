# PlantillaPedido Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PlantillaPedidoListEnvelope.schema.json\*](../schema-json/PlantillaPedidoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([PlantillaPedido](plantillapedido.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [activa](#activa)         | `boolean` | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-activa.md "undefined#/properties/activa")         |
| [clienteId](#clienteid)   | `integer` | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-clienteid.md "undefined#/properties/clienteId")   |
| [createdAt](#createdat)   | `string`  | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-createdat.md "undefined#/properties/createdAt")   |
| [id](#id)                 | `integer` | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-id.md "undefined#/properties/id")                 |
| [items](#items)           | `array`   | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-items.md "undefined#/properties/items")           |
| [nombre](#nombre)         | `string`  | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-nombre.md "undefined#/properties/nombre")         |
| [tenantId](#tenantid)     | `integer` | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-tenantid.md "undefined#/properties/tenantId")     |
| [updatedAt](#updatedat)   | `string`  | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-updatedat.md "undefined#/properties/updatedAt")   |
| [vendedorId](#vendedorid) | `integer` | Required | cannot be null | [PlantillaPedido](plantillapedido-properties-vendedorid.md "undefined#/properties/vendedorId") |

## activa



`activa`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is required

* Type: `object[]` ([PlantillaPedidoItem](plantillapedidoitem.md))

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([PlantillaPedidoItem](plantillapedidoitem.md))

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedido](plantillapedido-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`
