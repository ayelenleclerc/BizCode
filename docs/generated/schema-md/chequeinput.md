# ChequeInput Schema

```txt
undefined#/properties/chequeNuevo
```

Create received check when recording collection (#231).

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroInput.schema.json\*](../schema-json/CobroInput.schema.json "open original schema") |

## chequeNuevo Type

`object` ([ChequeInput](chequeinput.md))

# chequeNuevo Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [banco](#banco)                       | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-banco.md "undefined#/properties/banco")                       |
| [cbuOrigen](#cbuorigen)               | `string`  | Optional | cannot be null | [ChequeInput](chequeinput-properties-cbuorigen.md "undefined#/properties/cbuOrigen")               |
| [clienteId](#clienteid)               | `integer` | Optional | cannot be null | [ChequeInput](chequeinput-properties-clienteid.md "undefined#/properties/clienteId")               |
| [fechaEmision](#fechaemision)         | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-fechaemision.md "undefined#/properties/fechaEmision")         |
| [fechaVencimiento](#fechavencimiento) | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento") |
| [libradorCuit](#libradorcuit)         | `string`  | Optional | cannot be null | [ChequeInput](chequeinput-properties-libradorcuit.md "undefined#/properties/libradorCuit")         |
| [libradorNombre](#libradornombre)     | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-libradornombre.md "undefined#/properties/libradorNombre")     |
| [modalidad](#modalidad)               | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-modalidad.md "undefined#/properties/modalidad")               |
| [moneda](#moneda)                     | `string`  | Optional | cannot be null | [ChequeInput](chequeinput-properties-moneda.md "undefined#/properties/moneda")                     |
| [monto](#monto)                       | `number`  | Required | cannot be null | [ChequeInput](chequeinput-properties-monto.md "undefined#/properties/monto")                       |
| [numero](#numero)                     | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-numero.md "undefined#/properties/numero")                     |
| [observaciones](#observaciones)       | `string`  | Optional | cannot be null | [ChequeInput](chequeinput-properties-observaciones.md "undefined#/properties/observaciones")       |
| [proveedorId](#proveedorid)           | `integer` | Optional | cannot be null | [ChequeInput](chequeinput-properties-proveedorid.md "undefined#/properties/proveedorId")           |
| [sucursal](#sucursal)                 | `string`  | Optional | cannot be null | [ChequeInput](chequeinput-properties-sucursal.md "undefined#/properties/sucursal")                 |
| [tipo](#tipo)                         | `string`  | Required | cannot be null | [ChequeInput](chequeinput-properties-tipo.md "undefined#/properties/tipo")                         |

## banco



`banco`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-banco.md "undefined#/properties/banco")

### banco Type

`string`

## cbuOrigen



`cbuOrigen`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-cbuorigen.md "undefined#/properties/cbuOrigen")

### cbuOrigen Type

`string`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## fechaEmision



`fechaEmision`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-fechaemision.md "undefined#/properties/fechaEmision")

### fechaEmision Type

`string`

### fechaEmision Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaVencimiento



`fechaVencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

### fechaVencimiento Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## libradorCuit



`libradorCuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-libradorcuit.md "undefined#/properties/libradorCuit")

### libradorCuit Type

`string`

## libradorNombre



`libradorNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-libradornombre.md "undefined#/properties/libradorNombre")

### libradorNombre Type

`string`

## modalidad



`modalidad`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-modalidad.md "undefined#/properties/modalidad")

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

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

## monto



`monto`

* is required

* Type: `number`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-monto.md "undefined#/properties/monto")

### monto Type

`number`

## numero



`numero`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-numero.md "undefined#/properties/numero")

### numero Type

`string`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## sucursal



`sucursal`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-sucursal.md "undefined#/properties/sucursal")

### sucursal Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ChequeInput](chequeinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"recibido"` |             |
| `"emitido"`  |             |
