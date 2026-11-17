# VentaConOSCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VentaConOSCreateInput.schema.json](../schema-json/VentaConOSCreateInput.schema.json "open original schema") |

## VentaConOSCreateInput Type

`object` ([VentaConOSCreateInput](ventaconoscreateinput.md))

# VentaConOSCreateInput Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                     |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)       | `integer` | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-clienteid.md "undefined#/properties/clienteId")       |
| [facturaId](#facturaid)       | `integer` | Optional | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-facturaid.md "undefined#/properties/facturaId")       |
| [items](#items)               | `array`   | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-items.md "undefined#/properties/items")               |
| [nroAfiliado](#nroafiliado)   | `string`  | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-nroafiliado.md "undefined#/properties/nroAfiliado")   |
| [nroReceta](#nroreceta)       | `string`  | Optional | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-nroreceta.md "undefined#/properties/nroReceta")       |
| [obraSocialId](#obrasocialid) | `integer` | Required | cannot be null | [VentaConOSCreateInput](ventaconoscreateinput-properties-obrasocialid.md "undefined#/properties/obraSocialId") |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## items



`items`

* is required

* Type: `object[]` ([Details](ventaconoscreateinput-properties-items-items.md))

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](ventaconoscreateinput-properties-items-items.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## nroAfiliado



`nroAfiliado`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-nroafiliado.md "undefined#/properties/nroAfiliado")

### nroAfiliado Type

`string`

### nroAfiliado Constraints

**maximum length**: the maximum number of characters for this string is: `40`

**minimum length**: the minimum number of characters for this string is: `1`

## nroReceta



`nroReceta`

* is optional

* Type: `string`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-nroreceta.md "undefined#/properties/nroReceta")

### nroReceta Type

`string`

### nroReceta Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## obraSocialId



`obraSocialId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOSCreateInput](ventaconoscreateinput-properties-obrasocialid.md "undefined#/properties/obraSocialId")

### obraSocialId Type

`integer`

### obraSocialId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
