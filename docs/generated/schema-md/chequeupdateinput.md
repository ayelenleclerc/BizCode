# ChequeUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChequeUpdateInput.schema.json](../schema-json/ChequeUpdateInput.schema.json "open original schema") |

## ChequeUpdateInput Type

`object` ([ChequeUpdateInput](chequeupdateinput.md))

# ChequeUpdateInput Properties

| Property                              | Type     | Required | Nullable       | Defined by                                                                                                     |
| :------------------------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [banco](#banco)                       | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-banco.md "undefined#/properties/banco")                       |
| [cbuOrigen](#cbuorigen)               | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-cbuorigen.md "undefined#/properties/cbuOrigen")               |
| [fechaVencimiento](#fechavencimiento) | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento") |
| [libradorCuit](#libradorcuit)         | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-libradorcuit.md "undefined#/properties/libradorCuit")         |
| [libradorNombre](#libradornombre)     | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-libradornombre.md "undefined#/properties/libradorNombre")     |
| [observaciones](#observaciones)       | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-observaciones.md "undefined#/properties/observaciones")       |
| [sucursal](#sucursal)                 | `string` | Optional | cannot be null | [ChequeUpdateInput](chequeupdateinput-properties-sucursal.md "undefined#/properties/sucursal")                 |

## banco



`banco`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-banco.md "undefined#/properties/banco")

### banco Type

`string`

## cbuOrigen



`cbuOrigen`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-cbuorigen.md "undefined#/properties/cbuOrigen")

### cbuOrigen Type

`string`

## fechaVencimiento



`fechaVencimiento`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

### fechaVencimiento Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## libradorCuit



`libradorCuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-libradorcuit.md "undefined#/properties/libradorCuit")

### libradorCuit Type

`string`

## libradorNombre



`libradorNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-libradornombre.md "undefined#/properties/libradorNombre")

### libradorNombre Type

`string`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## sucursal



`sucursal`

* is optional

* Type: `string`

* cannot be null

* defined in: [ChequeUpdateInput](chequeupdateinput-properties-sucursal.md "undefined#/properties/sucursal")

### sucursal Type

`string`
