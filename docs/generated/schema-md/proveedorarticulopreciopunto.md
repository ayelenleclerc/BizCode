# ProveedorArticuloPrecioPunto Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorArticuloPrecioPunto.schema.json](../schema-json/ProveedorArticuloPrecioPunto.schema.json "open original schema") |

## ProveedorArticuloPrecioPunto Type

`object` ([ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto.md))

# ProveedorArticuloPrecioPunto Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [cantidad](#cantidad)             | `integer` | Required | cannot be null | [ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto-properties-cantidad.md "undefined#/properties/cantidad")             |
| [fecha](#fecha)                   | `string`  | Required | cannot be null | [ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto-properties-fecha.md "undefined#/properties/fecha")                   |
| [precioUnitario](#preciounitario) | `string`  | Required | cannot be null | [ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto-properties-preciounitario.md "undefined#/properties/precioUnitario") |

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## precioUnitario



`precioUnitario`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorArticuloPrecioPunto](proveedorarticulopreciopunto-properties-preciounitario.md "undefined#/properties/precioUnitario")

### precioUnitario Type

`string`
