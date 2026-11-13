# AnomaliaDetectada Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AnomaliaDetectadaListEnvelope.schema.json\*](../schema-json/AnomaliaDetectadaListEnvelope.schema.json "open original schema") |

## items Type

`object` ([AnomaliaDetectada](anomaliadetectada.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)     | `integer` | Optional | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-clienteid.md "undefined#/properties/clienteId")     |
| [confirmada](#confirmada)   | `boolean` | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-confirmada.md "undefined#/properties/confirmada")   |
| [createdAt](#createdat)     | `string`  | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-createdat.md "undefined#/properties/createdAt")     |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-descripcion.md "undefined#/properties/descripcion") |
| [detalle](#detalle)         | `object`  | Optional | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-detalle.md "undefined#/properties/detalle")         |
| [facturaId](#facturaid)     | `integer` | Optional | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-facturaid.md "undefined#/properties/facturaId")     |
| [id](#id)                   | `integer` | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-id.md "undefined#/properties/id")                   |
| [severidad](#severidad)     | `string`  | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-severidad.md "undefined#/properties/severidad")     |
| [tenantId](#tenantid)       | `integer` | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-tenantid.md "undefined#/properties/tenantId")       |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [AnomaliaDetectada](anomaliadetectada-properties-tipo.md "undefined#/properties/tipo")               |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## confirmada



`confirmada`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-confirmada.md "undefined#/properties/confirmada")

### confirmada Type

`boolean`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## detalle



`detalle`

* is optional

* Type: `object` ([Details](anomaliadetectada-properties-detalle.md))

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-detalle.md "undefined#/properties/detalle")

### detalle Type

`object` ([Details](anomaliadetectada-properties-detalle.md))

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## severidad



`severidad`

* is required

* Type: `string`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-severidad.md "undefined#/properties/severidad")

### severidad Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [AnomaliaDetectada](anomaliadetectada-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`
