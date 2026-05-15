# OrdenEntregaCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenEntregaCreateInput.schema.json](../schema-json/OrdenEntregaCreateInput.schema.json "open original schema") |

## OrdenEntregaCreateInput Type

`object` ([OrdenEntregaCreateInput](ordenentregacreateinput.md))

# OrdenEntregaCreateInput Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                   |
| :---------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid) | `integer` | Required | cannot be null | [OrdenEntregaCreateInput](ordenentregacreateinput-properties-clienteid.md "undefined#/properties/clienteId") |
| [driverId](#driverid)   | `integer` | Optional | cannot be null | [OrdenEntregaCreateInput](ordenentregacreateinput-properties-driverid.md "undefined#/properties/driverId")   |
| [facturaId](#facturaid) | `integer` | Optional | cannot be null | [OrdenEntregaCreateInput](ordenentregacreateinput-properties-facturaid.md "undefined#/properties/facturaId") |
| [fecha](#fecha)         | `string`  | Required | cannot be null | [OrdenEntregaCreateInput](ordenentregacreateinput-properties-fecha.md "undefined#/properties/fecha")         |
| [nota](#nota)           | `string`  | Optional | cannot be null | [OrdenEntregaCreateInput](ordenentregacreateinput-properties-nota.md "undefined#/properties/nota")           |
| [zonaId](#zonaid)       | `integer` | Optional | cannot be null | [OrdenEntregaCreateInput](ordenentregacreateinput-properties-zonaid.md "undefined#/properties/zonaId")       |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaCreateInput](ordenentregacreateinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## driverId



`driverId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaCreateInput](ordenentregacreateinput-properties-driverid.md "undefined#/properties/driverId")

### driverId Type

`integer`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaCreateInput](ordenentregacreateinput-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaCreateInput](ordenentregacreateinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaCreateInput](ordenentregacreateinput-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

### nota Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## zonaId



`zonaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenEntregaCreateInput](ordenentregacreateinput-properties-zonaid.md "undefined#/properties/zonaId")

### zonaId Type

`integer`
