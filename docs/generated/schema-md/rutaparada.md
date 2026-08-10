# RutaParada Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaParada.schema.json](../schema-json/RutaParada.schema.json "open original schema") |

## RutaParada Type

`object` ([RutaParada](rutaparada.md))

# RutaParada Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                         |
| :---------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------- |
| [cliente](#cliente)     | `object`  | Optional | cannot be null | [RutaParada](rutaparadacliente.md "undefined#/properties/cliente")                 |
| [clienteId](#clienteid) | `integer` | Required | cannot be null | [RutaParada](rutaparada-properties-clienteid.md "undefined#/properties/clienteId") |
| [createdAt](#createdat) | `string`  | Required | cannot be null | [RutaParada](rutaparada-properties-createdat.md "undefined#/properties/createdAt") |
| [estado](#estado)       | `string`  | Required | cannot be null | [RutaParada](rutaparadaestado.md "undefined#/properties/estado")                   |
| [id](#id)               | `integer` | Required | cannot be null | [RutaParada](rutaparada-properties-id.md "undefined#/properties/id")               |
| [motivo](#motivo)       | `string`  | Required | cannot be null | [RutaParada](rutaparada-properties-motivo.md "undefined#/properties/motivo")       |
| [orden](#orden)         | `integer` | Required | cannot be null | [RutaParada](rutaparada-properties-orden.md "undefined#/properties/orden")         |
| [rutaId](#rutaid)       | `integer` | Required | cannot be null | [RutaParada](rutaparada-properties-rutaid.md "undefined#/properties/rutaId")       |
| [updatedAt](#updatedat) | `string`  | Required | cannot be null | [RutaParada](rutaparada-properties-updatedat.md "undefined#/properties/updatedAt") |
| [visitaId](#visitaid)   | `integer` | Required | cannot be null | [RutaParada](rutaparada-properties-visitaid.md "undefined#/properties/visitaId")   |

## cliente



`cliente`

* is optional

* Type: `object` ([RutaParadaCliente](rutaparadacliente.md))

* cannot be null

* defined in: [RutaParada](rutaparadacliente.md "undefined#/properties/cliente")

### cliente Type

`object` ([RutaParadaCliente](rutaparadacliente.md))

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string` ([RutaParadaEstado](rutaparadaestado.md))

* cannot be null

* defined in: [RutaParada](rutaparadaestado.md "undefined#/properties/estado")

### estado Type

`string` ([RutaParadaEstado](rutaparadaestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"visitado"`    |             |
| `"postergado"`  |             |
| `"no_visitado"` |             |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

## orden



`orden`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-orden.md "undefined#/properties/orden")

### orden Type

`integer`

## rutaId



`rutaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-rutaid.md "undefined#/properties/rutaId")

### rutaId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## visitaId



`visitaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParada](rutaparada-properties-visitaid.md "undefined#/properties/visitaId")

### visitaId Type

`integer`
