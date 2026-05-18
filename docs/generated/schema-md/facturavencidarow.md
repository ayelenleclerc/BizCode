# FacturaVencidaRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaVencidaRow.schema.json](../schema-json/FacturaVencidaRow.schema.json "open original schema") |

## FacturaVencidaRow Type

`object` ([FacturaVencidaRow](facturavencidarow.md))

# FacturaVencidaRow Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                       |
| :---------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid) | `integer` | Required | cannot be null | [FacturaVencidaRow](facturavencidarow-properties-clienteid.md "undefined#/properties/clienteId") |
| [diasMora](#diasmora)   | `integer` | Required | cannot be null | [FacturaVencidaRow](facturavencidarow-properties-diasmora.md "undefined#/properties/diasMora")   |
| [facturaId](#facturaid) | `integer` | Required | cannot be null | [FacturaVencidaRow](facturavencidarow-properties-facturaid.md "undefined#/properties/facturaId") |
| [fecha](#fecha)         | `string`  | Required | cannot be null | [FacturaVencidaRow](facturavencidarow-properties-fecha.md "undefined#/properties/fecha")         |
| [rsocial](#rsocial)     | `string`  | Required | cannot be null | [FacturaVencidaRow](facturavencidarow-properties-rsocial.md "undefined#/properties/rsocial")     |
| [total](#total)         | `string`  | Required | cannot be null | [FacturaVencidaRow](facturavencidarow-properties-total.md "undefined#/properties/total")         |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaVencidaRow](facturavencidarow-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## diasMora



`diasMora`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaVencidaRow](facturavencidarow-properties-diasmora.md "undefined#/properties/diasMora")

### diasMora Type

`integer`

### diasMora Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaVencidaRow](facturavencidarow-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaVencidaRow](facturavencidarow-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaVencidaRow](facturavencidarow-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaVencidaRow](facturavencidarow-properties-total.md "undefined#/properties/total")

### total Type

`string`
