# EmpresaConfig Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EmpresaEnvelope.schema.json\*](../schema-json/EmpresaEnvelope.schema.json "open original schema") |

## data Type

`object` ([EmpresaConfig](empresaconfig.md))

# data Properties

| Property                                          | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [condicionIva](#condicioniva)                     | `string`  | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-condicioniva.md "undefined#/properties/condicionIva")                     |
| [cuit](#cuit)                                     | `string`  | Required | cannot be null | [EmpresaConfig](empresaconfig-properties-cuit.md "undefined#/properties/cuit")                                     |
| [domicilio](#domicilio)                           | `string`  | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-domicilio.md "undefined#/properties/domicilio")                           |
| [fechaInicioActividades](#fechainicioactividades) | `string`  | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-fechainicioactividades.md "undefined#/properties/fechaInicioActividades") |
| [id](#id)                                         | `integer` | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-id.md "undefined#/properties/id")                                         |
| [ingresosBrutos](#ingresosbrutos)                 | `string`  | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-ingresosbrutos.md "undefined#/properties/ingresosBrutos")                 |
| [logoUrl](#logourl)                               | `string`  | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-logourl.md "undefined#/properties/logoUrl")                               |
| [nombre](#nombre)                                 | `string`  | Required | cannot be null | [EmpresaConfig](empresaconfig-properties-nombre.md "undefined#/properties/nombre")                                 |
| [prefijoFactura](#prefijofactura)                 | `string`  | Required | cannot be null | [EmpresaConfig](empresaconfig-properties-prefijofactura.md "undefined#/properties/prefijoFactura")                 |
| [puntoVenta](#puntoventa)                         | `integer` | Required | cannot be null | [EmpresaConfig](empresaconfig-properties-puntoventa.md "undefined#/properties/puntoVenta")                         |
| [recordatorioDiasGracia](#recordatoriodiasgracia) | `integer` | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-recordatoriodiasgracia.md "undefined#/properties/recordatorioDiasGracia") |
| [recordatorioHoraFin](#recordatoriohorafin)       | `integer` | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-recordatoriohorafin.md "undefined#/properties/recordatorioHoraFin")       |
| [recordatorioHoraInicio](#recordatoriohorainicio) | `integer` | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-recordatoriohorainicio.md "undefined#/properties/recordatorioHoraInicio") |
| [timezone](#timezone)                             | `string`  | Optional | cannot be null | [EmpresaConfig](empresaconfig-properties-timezone.md "undefined#/properties/timezone")                             |
| [tipoFactura](#tipofactura)                       | `string`  | Required | cannot be null | [EmpresaConfig](empresaconfig-properties-tipofactura.md "undefined#/properties/tipoFactura")                       |

## condicionIva

Issuer VAT condition for legal invoice PDF header (#148).

`condicionIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-condicioniva.md "undefined#/properties/condicionIva")

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

* defined in: [EmpresaConfig](empresaconfig-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

### cuit Constraints

**maximum length**: the maximum number of characters for this string is: `14`

## domicilio



`domicilio`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-domicilio.md "undefined#/properties/domicilio")

### domicilio Type

`string`

### domicilio Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## fechaInicioActividades

Activity start date (YYYY-MM-DD).

`fechaInicioActividades`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-fechainicioactividades.md "undefined#/properties/fechaInicioActividades")

### fechaInicioActividades Type

`string`

### fechaInicioActividades Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id

Null when settings have not been saved yet (defaults only).

`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## ingresosBrutos



`ingresosBrutos`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-ingresosbrutos.md "undefined#/properties/ingresosBrutos")

### ingresosBrutos Type

`string`

### ingresosBrutos Constraints

**maximum length**: the maximum number of characters for this string is: `30`

## logoUrl



`logoUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-logourl.md "undefined#/properties/logoUrl")

### logoUrl Type

`string`

### logoUrl Constraints

**maximum length**: the maximum number of characters for this string is: `255`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## prefijoFactura

Four-digit invoice prefix derived from puntoVenta.

`prefijoFactura`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-prefijofactura.md "undefined#/properties/prefijoFactura")

### prefijoFactura Type

`string`

### prefijoFactura Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^[0-9]{4}$
```

[try pattern](https://regexr.com/?expression=%5E%5B0-9%5D%7B4%7D%24 "try regular expression with regexr.com")

## puntoVenta



`puntoVenta`

* is required

* Type: `integer`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-puntoventa.md "undefined#/properties/puntoVenta")

### puntoVenta Type

`integer`

### puntoVenta Constraints

**maximum**: the value of this number must smaller than or equal to: `9999`

**minimum**: the value of this number must greater than or equal to: `1`

## recordatorioDiasGracia

Grace days after due date before an invoice is eligible for collection reminders.

`recordatorioDiasGracia`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-recordatoriodiasgracia.md "undefined#/properties/recordatorioDiasGracia")

### recordatorioDiasGracia Type

`integer`

### recordatorioDiasGracia Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `0`

## recordatorioHoraFin

Business-hour window end (tenant local hour, exclusive).

`recordatorioHoraFin`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-recordatoriohorafin.md "undefined#/properties/recordatorioHoraFin")

### recordatorioHoraFin Type

`integer`

### recordatorioHoraFin Constraints

**maximum**: the value of this number must smaller than or equal to: `24`

**minimum**: the value of this number must greater than or equal to: `1`

## recordatorioHoraInicio

Business-hour window start (tenant local hour, inclusive).

`recordatorioHoraInicio`

* is optional

* Type: `integer`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-recordatoriohorainicio.md "undefined#/properties/recordatorioHoraInicio")

### recordatorioHoraInicio Type

`integer`

### recordatorioHoraInicio Constraints

**maximum**: the value of this number must smaller than or equal to: `23`

**minimum**: the value of this number must greater than or equal to: `0`

## timezone

IANA time zone for the daily reminder job and business-hour window.

`timezone`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-timezone.md "undefined#/properties/timezone")

### timezone Type

`string`

### timezone Constraints

**maximum length**: the maximum number of characters for this string is: `64`

## tipoFactura



`tipoFactura`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaConfig](empresaconfig-properties-tipofactura.md "undefined#/properties/tipoFactura")

### tipoFactura Type

`string`

### tipoFactura Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
| `"C"` |             |
