# EmpresaInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EmpresaInput.schema.json](../schema-json/EmpresaInput.schema.json "open original schema") |

## EmpresaInput Type

`object` ([EmpresaInput](empresainput.md))

# EmpresaInput Properties

| Property                                          | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [condicionIva](#condicioniva)                     | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-condicioniva.md "undefined#/properties/condicionIva")                     |
| [cuit](#cuit)                                     | `string`  | Required | cannot be null | [EmpresaInput](empresainput-properties-cuit.md "undefined#/properties/cuit")                                     |
| [domicilio](#domicilio)                           | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-domicilio.md "undefined#/properties/domicilio")                           |
| [fechaInicioActividades](#fechainicioactividades) | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-fechainicioactividades.md "undefined#/properties/fechaInicioActividades") |
| [ingresosBrutos](#ingresosbrutos)                 | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-ingresosbrutos.md "undefined#/properties/ingresosBrutos")                 |
| [logoUrl](#logourl)                               | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-logourl.md "undefined#/properties/logoUrl")                               |
| [nombre](#nombre)                                 | `string`  | Required | cannot be null | [EmpresaInput](empresainput-properties-nombre.md "undefined#/properties/nombre")                                 |
| [puntoVenta](#puntoventa)                         | `integer` | Required | cannot be null | [EmpresaInput](empresainput-properties-puntoventa.md "undefined#/properties/puntoVenta")                         |
| [recordatorioDiasGracia](#recordatoriodiasgracia) | `integer` | Optional | cannot be null | [EmpresaInput](empresainput-properties-recordatoriodiasgracia.md "undefined#/properties/recordatorioDiasGracia") |
| [recordatorioHoraFin](#recordatoriohorafin)       | `integer` | Optional | cannot be null | [EmpresaInput](empresainput-properties-recordatoriohorafin.md "undefined#/properties/recordatorioHoraFin")       |
| [recordatorioHoraInicio](#recordatoriohorainicio) | `integer` | Optional | cannot be null | [EmpresaInput](empresainput-properties-recordatoriohorainicio.md "undefined#/properties/recordatorioHoraInicio") |
| [timezone](#timezone)                             | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-timezone.md "undefined#/properties/timezone")                             |
| [tipoFactura](#tipofactura)                       | `string`  | Required | cannot be null | [EmpresaInput](empresainput-properties-tipofactura.md "undefined#/properties/tipoFactura")                       |

## condicionIva



`condicionIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-condicioniva.md "undefined#/properties/condicionIva")

### condicionIva Type

`string`

### condicionIva Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"RI"`     |             |
| `"Mono"`   |             |
| `"CF"`     |             |
| `"Exento"` |             |

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

### cuit Constraints

**maximum length**: the maximum number of characters for this string is: `14`

## domicilio



`domicilio`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-domicilio.md "undefined#/properties/domicilio")

### domicilio Type

`string`

### domicilio Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## fechaInicioActividades



`fechaInicioActividades`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-fechainicioactividades.md "undefined#/properties/fechaInicioActividades")

### fechaInicioActividades Type

`string`

### fechaInicioActividades Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## ingresosBrutos



`ingresosBrutos`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-ingresosbrutos.md "undefined#/properties/ingresosBrutos")

### ingresosBrutos Type

`string`

### ingresosBrutos Constraints

**maximum length**: the maximum number of characters for this string is: `30`

## logoUrl



`logoUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-logourl.md "undefined#/properties/logoUrl")

### logoUrl Type

`string`

### logoUrl Constraints

**maximum length**: the maximum number of characters for this string is: `255`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## puntoVenta



`puntoVenta`

* is required

* Type: `integer`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-puntoventa.md "undefined#/properties/puntoVenta")

### puntoVenta Type

`integer`

### puntoVenta Constraints

**maximum**: the value of this number must smaller than or equal to: `9999`

**minimum**: the value of this number must greater than or equal to: `1`

## recordatorioDiasGracia



`recordatorioDiasGracia`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-recordatoriodiasgracia.md "undefined#/properties/recordatorioDiasGracia")

### recordatorioDiasGracia Type

`integer`

### recordatorioDiasGracia Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `0`

## recordatorioHoraFin



`recordatorioHoraFin`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-recordatoriohorafin.md "undefined#/properties/recordatorioHoraFin")

### recordatorioHoraFin Type

`integer`

### recordatorioHoraFin Constraints

**maximum**: the value of this number must smaller than or equal to: `24`

**minimum**: the value of this number must greater than or equal to: `1`

## recordatorioHoraInicio



`recordatorioHoraInicio`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-recordatoriohorainicio.md "undefined#/properties/recordatorioHoraInicio")

### recordatorioHoraInicio Type

`integer`

### recordatorioHoraInicio Constraints

**maximum**: the value of this number must smaller than or equal to: `23`

**minimum**: the value of this number must greater than or equal to: `0`

## timezone



`timezone`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-timezone.md "undefined#/properties/timezone")

### timezone Type

`string`

### timezone Constraints

**maximum length**: the maximum number of characters for this string is: `64`

## tipoFactura



`tipoFactura`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-tipofactura.md "undefined#/properties/tipoFactura")

### tipoFactura Type

`string`

### tipoFactura Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
| `"C"` |             |
