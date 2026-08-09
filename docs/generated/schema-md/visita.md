# Visita Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VisitaListEnvelope.schema.json\*](../schema-json/VisitaListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Visita](visita.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)               | `integer` | Optional | cannot be null | [Visita](visita-properties-clienteid.md "undefined#/properties/clienteId")               |
| [createdAt](#createdat)               | `string`  | Optional | cannot be null | [Visita](visita-properties-createdat.md "undefined#/properties/createdAt")               |
| [duracionMinutos](#duracionminutos)   | `integer` | Optional | cannot be null | [Visita](visita-properties-duracionminutos.md "undefined#/properties/duracionMinutos")   |
| [estadoPlan](#estadoplan)             | `string`  | Optional | cannot be null | [Visita](visitaestadoplan.md "undefined#/properties/estadoPlan")                         |
| [fechaPlanificada](#fechaplanificada) | `string`  | Optional | cannot be null | [Visita](visita-properties-fechaplanificada.md "undefined#/properties/fechaPlanificada") |
| [id](#id)                             | `integer` | Optional | cannot be null | [Visita](visita-properties-id.md "undefined#/properties/id")                             |
| [notasVisita](#notasvisita)           | `string`  | Optional | cannot be null | [Visita](visita-properties-notasvisita.md "undefined#/properties/notasVisita")           |
| [orden](#orden)                       | `integer` | Optional | cannot be null | [Visita](visita-properties-orden.md "undefined#/properties/orden")                       |
| [pedidoId](#pedidoid)                 | `integer` | Optional | cannot be null | [Visita](visita-properties-pedidoid.md "undefined#/properties/pedidoId")                 |
| [resultado](#resultado)               | `string`  | Optional | cannot be null | [Visita](visita-properties-resultado.md "undefined#/properties/resultado")               |
| [tenantId](#tenantid)                 | `integer` | Optional | cannot be null | [Visita](visita-properties-tenantid.md "undefined#/properties/tenantId")                 |
| [ultimaCompraAt](#ultimacompraat)     | `string`  | Optional | cannot be null | [Visita](visita-properties-ultimacompraat.md "undefined#/properties/ultimaCompraAt")     |
| [updatedAt](#updatedat)               | `string`  | Optional | cannot be null | [Visita](visita-properties-updatedat.md "undefined#/properties/updatedAt")               |
| [vendedorId](#vendedorid)             | `integer` | Optional | cannot be null | [Visita](visita-properties-vendedorid.md "undefined#/properties/vendedorId")             |
| Additional Properties                 | Any       | Optional | can be null    |                                                                                          |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Visita](visita-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## duracionMinutos



`duracionMinutos`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-duracionminutos.md "undefined#/properties/duracionMinutos")

### duracionMinutos Type

`integer`

## estadoPlan



`estadoPlan`

* is optional

* Type: `string` ([VisitaEstadoPlan](visitaestadoplan.md))

* cannot be null

* defined in: [Visita](visitaestadoplan.md "undefined#/properties/estadoPlan")

### estadoPlan Type

`string` ([VisitaEstadoPlan](visitaestadoplan.md))

### estadoPlan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"completada"`  |             |
| `"no_visitada"` |             |

## fechaPlanificada



`fechaPlanificada`

* is optional

* Type: `string`

* cannot be null

* defined in: [Visita](visita-properties-fechaplanificada.md "undefined#/properties/fechaPlanificada")

### fechaPlanificada Type

`string`

### fechaPlanificada Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## notasVisita



`notasVisita`

* is optional

* Type: `string`

* cannot be null

* defined in: [Visita](visita-properties-notasvisita.md "undefined#/properties/notasVisita")

### notasVisita Type

`string`

### notasVisita Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## orden



`orden`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-orden.md "undefined#/properties/orden")

### orden Type

`integer`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## resultado



`resultado`

* is optional

* Type: `string`

* cannot be null

* defined in: [Visita](visita-properties-resultado.md "undefined#/properties/resultado")

### resultado Type

`string`

### resultado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"venta"`           |             |
| `"sin_pedido"`      |             |
| `"cliente_ausente"` |             |
| `"otro"`            |             |
| `null`              |             |

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## ultimaCompraAt



`ultimaCompraAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Visita](visita-properties-ultimacompraat.md "undefined#/properties/ultimaCompraAt")

### ultimaCompraAt Type

`string`

### ultimaCompraAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## updatedAt



`updatedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Visita](visita-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Visita](visita-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
