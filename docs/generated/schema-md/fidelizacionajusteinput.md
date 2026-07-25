# FidelizacionAjusteInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FidelizacionAjusteInput.schema.json](../schema-json/FidelizacionAjusteInput.schema.json "open original schema") |

## FidelizacionAjusteInput Type

`object` ([FidelizacionAjusteInput](fidelizacionajusteinput.md))

# FidelizacionAjusteInput Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                   |
| :---------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid) | `integer` | Required | cannot be null | [FidelizacionAjusteInput](fidelizacionajusteinput-properties-clienteid.md "undefined#/properties/clienteId") |
| [concepto](#concepto)   | `string`  | Optional | cannot be null | [FidelizacionAjusteInput](fidelizacionajusteinput-properties-concepto.md "undefined#/properties/concepto")   |
| [puntos](#puntos)       | `integer` | Required | cannot be null | [FidelizacionAjusteInput](fidelizacionajusteinput-properties-puntos.md "undefined#/properties/puntos")       |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FidelizacionAjusteInput](fidelizacionajusteinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## concepto



`concepto`

* is optional

* Type: `string`

* cannot be null

* defined in: [FidelizacionAjusteInput](fidelizacionajusteinput-properties-concepto.md "undefined#/properties/concepto")

### concepto Type

`string`

### concepto Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## puntos

Non-zero signed integer; positive credits, negative debits

`puntos`

* is required

* Type: `integer`

* cannot be null

* defined in: [FidelizacionAjusteInput](fidelizacionajusteinput-properties-puntos.md "undefined#/properties/puntos")

### puntos Type

`integer`
