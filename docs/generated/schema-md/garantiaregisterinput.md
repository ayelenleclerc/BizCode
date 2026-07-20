# GarantiaRegisterInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [GarantiaRegisterInput.schema.json](../schema-json/GarantiaRegisterInput.schema.json "open original schema") |

## GarantiaRegisterInput Type

`object` ([GarantiaRegisterInput](garantiaregisterinput.md))

# GarantiaRegisterInput Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                               |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)               | `integer` | Required | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-articuloid.md "undefined#/properties/articuloId")               |
| [clienteId](#clienteid)                 | `integer` | Required | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-clienteid.md "undefined#/properties/clienteId")                 |
| [descripcionEquipo](#descripcionequipo) | `string`  | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-descripcionequipo.md "undefined#/properties/descripcionEquipo") |
| [facturaId](#facturaid)                 | `integer` | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-facturaid.md "undefined#/properties/facturaId")                 |
| [facturaItemId](#facturaitemid)         | `integer` | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-facturaitemid.md "undefined#/properties/facturaItemId")         |
| [fechaVenta](#fechaventa)               | `string`  | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-fechaventa.md "undefined#/properties/fechaVenta")               |
| [mesesGarantia](#mesesgarantia)         | `integer` | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")         |
| [nroImei](#nroimei)                     | `string`  | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-nroimei.md "undefined#/properties/nroImei")                     |
| [nroSerie](#nroserie)                   | `string`  | Optional | cannot be null | [GarantiaRegisterInput](garantiaregisterinput-properties-nroserie.md "undefined#/properties/nroSerie")                   |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## descripcionEquipo



`descripcionEquipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-descripcionequipo.md "undefined#/properties/descripcionEquipo")

### descripcionEquipo Type

`string`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## facturaItemId



`facturaItemId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-facturaitemid.md "undefined#/properties/facturaItemId")

### facturaItemId Type

`integer`

## fechaVenta



`fechaVenta`

* is optional

* Type: `string`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-fechaventa.md "undefined#/properties/fechaVenta")

### fechaVenta Type

`string`

## mesesGarantia



`mesesGarantia`

* is optional

* Type: `integer`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-mesesgarantia.md "undefined#/properties/mesesGarantia")

### mesesGarantia Type

`integer`

### mesesGarantia Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## nroImei



`nroImei`

* is optional

* Type: `string`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-nroimei.md "undefined#/properties/nroImei")

### nroImei Type

`string`

## nroSerie



`nroSerie`

* is optional

* Type: `string`

* cannot be null

* defined in: [GarantiaRegisterInput](garantiaregisterinput-properties-nroserie.md "undefined#/properties/nroSerie")

### nroSerie Type

`string`
