# DevolucionEntrega Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DevolucionEntregaRemitEnvelope.schema.json\*](../schema-json/DevolucionEntregaRemitEnvelope.schema.json "open original schema") |

## items Type

`object` ([DevolucionEntrega](devolucionentrega.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-createdat.md "undefined#/properties/createdAt")         |
| [estado](#estado)               | `string`  | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-estado.md "undefined#/properties/estado")               |
| [hasFoto](#hasfoto)             | `boolean` | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-hasfoto.md "undefined#/properties/hasFoto")             |
| [id](#id)                       | `integer` | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-id.md "undefined#/properties/id")                       |
| [lineas](#lineas)               | `array`   | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-lineas.md "undefined#/properties/lineas")               |
| [motivo](#motivo)               | `string`  | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-motivo.md "undefined#/properties/motivo")               |
| [motivoDetalle](#motivodetalle) | `string`  | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-motivodetalle.md "undefined#/properties/motivoDetalle") |
| [notaCreditoId](#notacreditoid) | `integer` | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-notacreditoid.md "undefined#/properties/notaCreditoId") |
| [remittedAt](#remittedat)       | `string`  | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-remittedat.md "undefined#/properties/remittedAt")       |
| [repartoId](#repartoid)         | `integer` | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-repartoid.md "undefined#/properties/repartoId")         |
| [repartoItemId](#repartoitemid) | `integer` | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-repartoitemid.md "undefined#/properties/repartoItemId") |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [DevolucionEntrega](devolucionentrega-properties-tenantid.md "undefined#/properties/tenantId")           |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"registered"` |             |
| `"remitted"`   |             |

## hasFoto



`hasFoto`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-hasfoto.md "undefined#/properties/hasFoto")

### hasFoto Type

`boolean`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## lineas



`lineas`

* is required

* Type: `object[]` ([DevolucionEntregaLinea](devolucionentregalinea.md))

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-lineas.md "undefined#/properties/lineas")

### lineas Type

`object[]` ([DevolucionEntregaLinea](devolucionentregalinea.md))

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"rechazo"`         |             |
| `"producto_dañado"` |             |

## motivoDetalle



`motivoDetalle`

* is required

* Type: `string`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-motivodetalle.md "undefined#/properties/motivoDetalle")

### motivoDetalle Type

`string`

## notaCreditoId



`notaCreditoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-notacreditoid.md "undefined#/properties/notaCreditoId")

### notaCreditoId Type

`integer`

## remittedAt



`remittedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-remittedat.md "undefined#/properties/remittedAt")

### remittedAt Type

`string`

### remittedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## repartoId



`repartoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-repartoid.md "undefined#/properties/repartoId")

### repartoId Type

`integer`

## repartoItemId



`repartoItemId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-repartoitemid.md "undefined#/properties/repartoItemId")

### repartoItemId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntrega](devolucionentrega-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`
