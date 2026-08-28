# LibroPsicotropicoMovimiento Schema

```txt
undefined
```

Internal psychotropic book entry (#204). Internal audit trail, not the official SEDRONAR filing format.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroPsicotropicoMovimiento.schema.json](../schema-json/LibroPsicotropicoMovimiento.schema.json "open original schema") |

## LibroPsicotropicoMovimiento Type

`object` ([LibroPsicotropicoMovimiento](libropsicotropicomovimiento.md))

# LibroPsicotropicoMovimiento Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [articulo](#articulo)           | `object`  | Optional | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-articulo.md "undefined#/properties/articulo")           |
| [articuloId](#articuloid)       | `integer` | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-articuloid.md "undefined#/properties/articuloId")       |
| [cantidad](#cantidad)           | `number`  | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-cantidad.md "undefined#/properties/cantidad")           |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-createdat.md "undefined#/properties/createdAt")         |
| [id](#id)                       | `integer` | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-id.md "undefined#/properties/id")                       |
| [lote](#lote)                   | `object`  | Optional | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-lote.md "undefined#/properties/lote")                   |
| [loteId](#loteid)               | `integer` | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-loteid.md "undefined#/properties/loteId")               |
| [observaciones](#observaciones) | `string`  | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-observaciones.md "undefined#/properties/observaciones") |
| [recetaId](#recetaid)           | `integer` | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-recetaid.md "undefined#/properties/recetaId")           |
| [referencia](#referencia)       | `string`  | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-referencia.md "undefined#/properties/referencia")       |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-tenantid.md "undefined#/properties/tenantId")           |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [LibroPsicotropicoMovimiento](libropsicotropicotipo.md "undefined#/properties/tipo")                                         |

## articulo



`articulo`

* is optional

* Type: `object` ([Details](libropsicotropicomovimiento-properties-articulo.md))

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Details](libropsicotropicomovimiento-properties-articulo.md))

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`number`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## lote



`lote`

* is optional

* Type: `object` ([Details](libropsicotropicomovimiento-properties-lote.md))

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-lote.md "undefined#/properties/lote")

### lote Type

`object` ([Details](libropsicotropicomovimiento-properties-lote.md))

## loteId



`loteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-loteid.md "undefined#/properties/loteId")

### loteId Type

`integer`

## observaciones



`observaciones`

* is required

* Type: `string`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `300`

## recetaId



`recetaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-recetaid.md "undefined#/properties/recetaId")

### recetaId Type

`integer`

## referencia



`referencia`

* is required

* Type: `string`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

### referencia Constraints

**maximum length**: the maximum number of characters for this string is: `60`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicomovimiento-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string` ([LibroPsicotropicoTipo](libropsicotropicotipo.md))

* cannot be null

* defined in: [LibroPsicotropicoMovimiento](libropsicotropicotipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([LibroPsicotropicoTipo](libropsicotropicotipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"ingreso"` |             |
| `"egreso"`  |             |
| `"ajuste"`  |             |
