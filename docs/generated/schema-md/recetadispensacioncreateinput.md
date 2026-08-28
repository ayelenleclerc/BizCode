# RecetaDispensacionCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecetaDispensacionCreateInput.schema.json](../schema-json/RecetaDispensacionCreateInput.schema.json "open original schema") |

## RecetaDispensacionCreateInput Type

`object` ([RecetaDispensacionCreateInput](recetadispensacioncreateinput.md))

# RecetaDispensacionCreateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)         | `integer` | Optional | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-clienteid.md "undefined#/properties/clienteId")         |
| [facturaId](#facturaid)         | `integer` | Optional | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-facturaid.md "undefined#/properties/facturaId")         |
| [fechaReceta](#fechareceta)     | `string`  | Required | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-fechareceta.md "undefined#/properties/fechaReceta")     |
| [matricula](#matricula)         | `string`  | Required | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-matricula.md "undefined#/properties/matricula")         |
| [medicoNombre](#mediconombre)   | `string`  | Required | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-mediconombre.md "undefined#/properties/medicoNombre")   |
| [numeroReceta](#numeroreceta)   | `string`  | Required | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-numeroreceta.md "undefined#/properties/numeroReceta")   |
| [observaciones](#observaciones) | `string`  | Optional | cannot be null | [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-observaciones.md "undefined#/properties/observaciones") |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## fechaReceta



`fechaReceta`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-fechareceta.md "undefined#/properties/fechaReceta")

### fechaReceta Type

`string`

### fechaReceta Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## matricula



`matricula`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-matricula.md "undefined#/properties/matricula")

### matricula Type

`string`

### matricula Constraints

**maximum length**: the maximum number of characters for this string is: `40`

**minimum length**: the minimum number of characters for this string is: `1`

## medicoNombre



`medicoNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-mediconombre.md "undefined#/properties/medicoNombre")

### medicoNombre Type

`string`

### medicoNombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`

## numeroReceta



`numeroReceta`

* is required

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-numeroreceta.md "undefined#/properties/numeroReceta")

### numeroReceta Type

`string`

### numeroReceta Constraints

**maximum length**: the maximum number of characters for this string is: `40`

**minimum length**: the minimum number of characters for this string is: `1`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [RecetaDispensacionCreateInput](recetadispensacioncreateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`
