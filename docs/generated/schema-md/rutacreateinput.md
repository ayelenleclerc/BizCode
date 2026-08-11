# RutaCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaCreateInput.schema.json](../schema-json/RutaCreateInput.schema.json "open original schema") |

## RutaCreateInput Type

`object` ([RutaCreateInput](rutacreateinput.md))

# RutaCreateInput Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [clienteIds](#clienteids) | `array`   | Optional | cannot be null | [RutaCreateInput](rutacreateinput-properties-clienteids.md "undefined#/properties/clienteIds") |
| [fecha](#fecha)           | `string`  | Required | cannot be null | [RutaCreateInput](rutacreateinput-properties-fecha.md "undefined#/properties/fecha")           |
| [vendedorId](#vendedorid) | `integer` | Required | cannot be null | [RutaCreateInput](rutacreateinput-properties-vendedorid.md "undefined#/properties/vendedorId") |

## clienteIds



`clienteIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [RutaCreateInput](rutacreateinput-properties-clienteids.md "undefined#/properties/clienteIds")

### clienteIds Type

`integer[]`

### clienteIds Constraints

**maximum number of items**: the maximum number of items for this array is: `50`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [RutaCreateInput](rutacreateinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaCreateInput](rutacreateinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

### vendedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
