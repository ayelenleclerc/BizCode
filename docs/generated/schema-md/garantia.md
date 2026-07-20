# Garantia Schema

```txt
undefined#/properties/data/properties/garantia
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [GarantiaLookupEnvelope.schema.json\*](../schema-json/GarantiaLookupEnvelope.schema.json "open original schema") |

## garantia Type

`object` ([Garantia](garantia.md))

# garantia Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                     |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)               | `integer` | Optional | cannot be null | [Garantia](garantia-properties-articuloid.md "undefined#/properties/articuloId")               |
| [clienteId](#clienteid)                 | `integer` | Optional | cannot be null | [Garantia](garantia-properties-clienteid.md "undefined#/properties/clienteId")                 |
| [descripcionEquipo](#descripcionequipo) | `string`  | Optional | cannot be null | [Garantia](garantia-properties-descripcionequipo.md "undefined#/properties/descripcionEquipo") |
| [estado](#estado)                       | `string`  | Optional | cannot be null | [Garantia](garantiaestado.md "undefined#/properties/estado")                                   |
| [facturaId](#facturaid)                 | `integer` | Optional | cannot be null | [Garantia](garantia-properties-facturaid.md "undefined#/properties/facturaId")                 |
| [facturaItemId](#facturaitemid)         | `integer` | Optional | cannot be null | [Garantia](garantia-properties-facturaitemid.md "undefined#/properties/facturaItemId")         |
| [fechaVencimiento](#fechavencimiento)   | `string`  | Optional | cannot be null | [Garantia](garantia-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")   |
| [fechaVenta](#fechaventa)               | `string`  | Optional | cannot be null | [Garantia](garantia-properties-fechaventa.md "undefined#/properties/fechaVenta")               |
| [id](#id)                               | `integer` | Optional | cannot be null | [Garantia](garantia-properties-id.md "undefined#/properties/id")                               |
| [mesesGarantia](#mesesgarantia)         | `integer` | Optional | cannot be null | [Garantia](garantia-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")         |
| [nroImei](#nroimei)                     | `string`  | Optional | cannot be null | [Garantia](garantia-properties-nroimei.md "undefined#/properties/nroImei")                     |
| [nroSerie](#nroserie)                   | `string`  | Optional | cannot be null | [Garantia](garantia-properties-nroserie.md "undefined#/properties/nroSerie")                   |
| [usos](#usos)                           | `array`   | Optional | cannot be null | [Garantia](garantia-properties-usos.md "undefined#/properties/usos")                           |
| Additional Properties                   | Any       | Optional | can be null    |                                                                                                |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Garantia](garantia-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Garantia](garantia-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## descripcionEquipo



`descripcionEquipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Garantia](garantia-properties-descripcionequipo.md "undefined#/properties/descripcionEquipo")

### descripcionEquipo Type

`string`

## estado



`estado`

* is optional

* Type: `string` ([GarantiaEstado](garantiaestado.md))

* cannot be null

* defined in: [Garantia](garantiaestado.md "undefined#/properties/estado")

### estado Type

`string` ([GarantiaEstado](garantiaestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"vigente"` |             |
| `"vencida"` |             |
| `"anulada"` |             |

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Garantia](garantia-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## facturaItemId



`facturaItemId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Garantia](garantia-properties-facturaitemid.md "undefined#/properties/facturaItemId")

### facturaItemId Type

`integer`

## fechaVencimiento



`fechaVencimiento`

* is optional

* Type: `string`

* cannot be null

* defined in: [Garantia](garantia-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

### fechaVencimiento Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaVenta



`fechaVenta`

* is optional

* Type: `string`

* cannot be null

* defined in: [Garantia](garantia-properties-fechaventa.md "undefined#/properties/fechaVenta")

### fechaVenta Type

`string`

### fechaVenta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Garantia](garantia-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## mesesGarantia



`mesesGarantia`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Garantia](garantia-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")

### mesesGarantia Type

`integer`

## nroImei



`nroImei`

* is optional

* Type: `string`

* cannot be null

* defined in: [Garantia](garantia-properties-nroimei.md "undefined#/properties/nroImei")

### nroImei Type

`string`

## nroSerie



`nroSerie`

* is optional

* Type: `string`

* cannot be null

* defined in: [Garantia](garantia-properties-nroserie.md "undefined#/properties/nroSerie")

### nroSerie Type

`string`

## usos



`usos`

* is optional

* Type: `object[]` ([GarantiaUso](garantiauso.md))

* cannot be null

* defined in: [Garantia](garantia-properties-usos.md "undefined#/properties/usos")

### usos Type

`object[]` ([GarantiaUso](garantiauso.md))

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
