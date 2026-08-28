# RecetaDispensacion Schema

```txt
undefined#/properties/data/items
```

Prescription recorded locally when dispensing controlled articles (#204).

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecetaDispensacionListEnvelope.schema.json\*](../schema-json/RecetaDispensacionListEnvelope.schema.json "open original schema") |

## items Type

`object` ([RecetaDispensacion](recetadispensacion.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [cliente](#cliente)             | `object`  | Optional | cannot be null | [RecetaDispensacion](recetadispensacion-properties-cliente.md "undefined#/properties/cliente")             |
| [clienteId](#clienteid)         | `integer` | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-clienteid.md "undefined#/properties/clienteId")         |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-createdat.md "undefined#/properties/createdAt")         |
| [facturaId](#facturaid)         | `integer` | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-facturaid.md "undefined#/properties/facturaId")         |
| [fechaReceta](#fechareceta)     | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-fechareceta.md "undefined#/properties/fechaReceta")     |
| [id](#id)                       | `integer` | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-id.md "undefined#/properties/id")                       |
| [matricula](#matricula)         | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-matricula.md "undefined#/properties/matricula")         |
| [medicoNombre](#mediconombre)   | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-mediconombre.md "undefined#/properties/medicoNombre")   |
| [numeroReceta](#numeroreceta)   | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-numeroreceta.md "undefined#/properties/numeroReceta")   |
| [observaciones](#observaciones) | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-observaciones.md "undefined#/properties/observaciones") |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-tenantid.md "undefined#/properties/tenantId")           |
| [updatedAt](#updatedat)         | `string`  | Required | cannot be null | [RecetaDispensacion](recetadispensacion-properties-updatedat.md "undefined#/properties/updatedAt")         |

## cliente



`cliente`

* is optional

* Type: `object` ([Details](recetadispensacion-properties-cliente.md))

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-cliente.md "undefined#/properties/cliente")

### cliente Type

`object` ([Details](recetadispensacion-properties-cliente.md))

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fechaReceta



`fechaReceta`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-fechareceta.md "undefined#/properties/fechaReceta")

### fechaReceta Type

`string`

### fechaReceta Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## matricula



`matricula`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-matricula.md "undefined#/properties/matricula")

### matricula Type

`string`

### matricula Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## medicoNombre



`medicoNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-mediconombre.md "undefined#/properties/medicoNombre")

### medicoNombre Type

`string`

### medicoNombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`

## numeroReceta



`numeroReceta`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-numeroreceta.md "undefined#/properties/numeroReceta")

### numeroReceta Type

`string`

### numeroReceta Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## observaciones



`observaciones`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacion](recetadispensacion-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
