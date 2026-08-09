# VisitaCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VisitaCreateInput.schema.json](../schema-json/VisitaCreateInput.schema.json "open original schema") |

## VisitaCreateInput Type

`object` ([VisitaCreateInput](visitacreateinput.md))

# VisitaCreateInput Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)               | `integer` | Required | cannot be null | [VisitaCreateInput](visitacreateinput-properties-clienteid.md "undefined#/properties/clienteId")               |
| [fechaPlanificada](#fechaplanificada) | `string`  | Required | cannot be null | [VisitaCreateInput](visitacreateinput-properties-fechaplanificada.md "undefined#/properties/fechaPlanificada") |
| [notasVisita](#notasvisita)           | `string`  | Optional | cannot be null | [VisitaCreateInput](visitacreateinput-properties-notasvisita.md "undefined#/properties/notasVisita")           |
| [orden](#orden)                       | `integer` | Optional | cannot be null | [VisitaCreateInput](visitacreateinput-properties-orden.md "undefined#/properties/orden")                       |
| [vendedorId](#vendedorid)             | `integer` | Required | cannot be null | [VisitaCreateInput](visitacreateinput-properties-vendedorid.md "undefined#/properties/vendedorId")             |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VisitaCreateInput](visitacreateinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## fechaPlanificada



`fechaPlanificada`

* is required

* Type: `string`

* cannot be null

* defined in: [VisitaCreateInput](visitacreateinput-properties-fechaplanificada.md "undefined#/properties/fechaPlanificada")

### fechaPlanificada Type

`string`

### fechaPlanificada Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## notasVisita



`notasVisita`

* is optional

* Type: `string`

* cannot be null

* defined in: [VisitaCreateInput](visitacreateinput-properties-notasvisita.md "undefined#/properties/notasVisita")

### notasVisita Type

`string`

### notasVisita Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## orden



`orden`

* is optional

* Type: `integer`

* cannot be null

* defined in: [VisitaCreateInput](visitacreateinput-properties-orden.md "undefined#/properties/orden")

### orden Type

`integer`

### orden Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VisitaCreateInput](visitacreateinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

### vendedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
