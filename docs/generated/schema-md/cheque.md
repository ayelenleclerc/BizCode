# Cheque Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChequeListEnvelope.schema.json\*](../schema-json/ChequeListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Cheque](cheque.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [banco](#banco)                       | `string`  | Required | cannot be null | [Cheque](cheque-properties-banco.md "undefined#/properties/banco")                       |
| [cbuOrigen](#cbuorigen)               | `string`  | Optional | cannot be null | [Cheque](cheque-properties-cbuorigen.md "undefined#/properties/cbuOrigen")               |
| [clienteId](#clienteid)               | `integer` | Optional | cannot be null | [Cheque](cheque-properties-clienteid.md "undefined#/properties/clienteId")               |
| [estado](#estado)                     | `string`  | Required | cannot be null | [Cheque](cheque-properties-estado.md "undefined#/properties/estado")                     |
| [fechaEmision](#fechaemision)         | `string`  | Required | cannot be null | [Cheque](cheque-properties-fechaemision.md "undefined#/properties/fechaEmision")         |
| [fechaVencimiento](#fechavencimiento) | `string`  | Required | cannot be null | [Cheque](cheque-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento") |
| [id](#id)                             | `integer` | Required | cannot be null | [Cheque](cheque-properties-id.md "undefined#/properties/id")                             |
| [libradorCuit](#libradorcuit)         | `string`  | Optional | cannot be null | [Cheque](cheque-properties-libradorcuit.md "undefined#/properties/libradorCuit")         |
| [libradorNombre](#libradornombre)     | `string`  | Required | cannot be null | [Cheque](cheque-properties-libradornombre.md "undefined#/properties/libradorNombre")     |
| [modalidad](#modalidad)               | `string`  | Required | cannot be null | [Cheque](cheque-properties-modalidad.md "undefined#/properties/modalidad")               |
| [moneda](#moneda)                     | `string`  | Required | cannot be null | [Cheque](cheque-properties-moneda.md "undefined#/properties/moneda")                     |
| [monto](#monto)                       | `string`  | Required | cannot be null | [Cheque](cheque-properties-monto.md "undefined#/properties/monto")                       |
| [numero](#numero)                     | `string`  | Required | cannot be null | [Cheque](cheque-properties-numero.md "undefined#/properties/numero")                     |
| [observaciones](#observaciones)       | `string`  | Optional | cannot be null | [Cheque](cheque-properties-observaciones.md "undefined#/properties/observaciones")       |
| [proveedorId](#proveedorid)           | `integer` | Optional | cannot be null | [Cheque](cheque-properties-proveedorid.md "undefined#/properties/proveedorId")           |
| [sucursal](#sucursal)                 | `string`  | Optional | cannot be null | [Cheque](cheque-properties-sucursal.md "undefined#/properties/sucursal")                 |
| [tipo](#tipo)                         | `string`  | Required | cannot be null | [Cheque](cheque-properties-tipo.md "undefined#/properties/tipo")                         |

## banco



`banco`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-banco.md "undefined#/properties/banco")

### banco Type

`string`

## cbuOrigen



`cbuOrigen`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-cbuorigen.md "undefined#/properties/cbuOrigen")

### cbuOrigen Type

`string`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cheque](cheque-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"en_cartera"` |             |
| `"emitido"`    |             |
| `"depositado"` |             |
| `"endosado"`   |             |
| `"descontado"` |             |
| `"cobrado"`    |             |
| `"rechazado"`  |             |
| `"anulado"`    |             |

## fechaEmision



`fechaEmision`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-fechaemision.md "undefined#/properties/fechaEmision")

### fechaEmision Type

`string`

### fechaEmision Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaVencimiento



`fechaVencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

### fechaVencimiento Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Cheque](cheque-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## libradorCuit



`libradorCuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-libradorcuit.md "undefined#/properties/libradorCuit")

### libradorCuit Type

`string`

## libradorNombre



`libradorNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-libradornombre.md "undefined#/properties/libradorNombre")

### libradorNombre Type

`string`

## modalidad



`modalidad`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-modalidad.md "undefined#/properties/modalidad")

### modalidad Type

`string`

### modalidad Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"fisico"` |             |
| `"echeq"`  |             |

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

## monto



`monto`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-monto.md "undefined#/properties/monto")

### monto Type

`string`

## numero



`numero`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-numero.md "undefined#/properties/numero")

### numero Type

`string`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cheque](cheque-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## sucursal



`sucursal`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-sucursal.md "undefined#/properties/sucursal")

### sucursal Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [Cheque](cheque-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"recibido"` |             |
| `"emitido"`  |             |
