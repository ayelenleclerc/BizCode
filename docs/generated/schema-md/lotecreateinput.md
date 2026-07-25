# LoteCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteCreateInput.schema.json](../schema-json/LoteCreateInput.schema.json "open original schema") |

## LoteCreateInput Type

`object` ([LoteCreateInput](lotecreateinput.md))

# LoteCreateInput Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)             | `integer` | Required | cannot be null | [LoteCreateInput](lotecreateinput-properties-articuloid.md "undefined#/properties/articuloId")             |
| [depositoId](#depositoid)             | `integer` | Required | cannot be null | [LoteCreateInput](lotecreateinput-properties-depositoid.md "undefined#/properties/depositoId")             |
| [fechaVencimiento](#fechavencimiento) | `string`  | Required | cannot be null | [LoteCreateInput](lotecreateinput-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento") |
| [nroLote](#nrolote)                   | `string`  | Required | cannot be null | [LoteCreateInput](lotecreateinput-properties-nrolote.md "undefined#/properties/nroLote")                   |
| [proveedorId](#proveedorid)           | `integer` | Optional | cannot be null | [LoteCreateInput](lotecreateinput-properties-proveedorid.md "undefined#/properties/proveedorId")           |
| [stockInicial](#stockinicial)         | `integer` | Optional | cannot be null | [LoteCreateInput](lotecreateinput-properties-stockinicial.md "undefined#/properties/stockInicial")         |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LoteCreateInput](lotecreateinput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## depositoId



`depositoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LoteCreateInput](lotecreateinput-properties-depositoid.md "undefined#/properties/depositoId")

### depositoId Type

`integer`

### depositoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## fechaVencimiento



`fechaVencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [LoteCreateInput](lotecreateinput-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

## nroLote



`nroLote`

* is required

* Type: `string`

* cannot be null

* defined in: [LoteCreateInput](lotecreateinput-properties-nrolote.md "undefined#/properties/nroLote")

### nroLote Type

`string`

### nroLote Constraints

**maximum length**: the maximum number of characters for this string is: `60`

**minimum length**: the minimum number of characters for this string is: `1`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [LoteCreateInput](lotecreateinput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## stockInicial



`stockInicial`

* is optional

* Type: `integer`

* cannot be null

* defined in: [LoteCreateInput](lotecreateinput-properties-stockinicial.md "undefined#/properties/stockInicial")

### stockInicial Type

`integer`

### stockInicial Constraints

**minimum**: the value of this number must greater than or equal to: `0`
