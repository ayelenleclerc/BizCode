# ProveedorCompraRow Schema

```txt
undefined#/properties/compras/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorHistorialResumen.schema.json\*](../schema-json/ProveedorHistorialResumen.schema.json "open original schema") |

## items Type

`object` ([ProveedorCompraRow](proveedorcomprarow.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [estado](#estado)               | `string`  | Optional | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-estado.md "undefined#/properties/estado")               |
| [estadoPago](#estadopago)       | `string`  | Required | cannot be null | [ProveedorCompraRow](proveedorcompraestadopago.md "undefined#/properties/estadoPago")                      |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-fecha.md "undefined#/properties/fecha")                 |
| [id](#id)                       | `integer` | Required | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-id.md "undefined#/properties/id")                       |
| [ordenCompraId](#ordencompraid) | `integer` | Optional | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-ordencompraid.md "undefined#/properties/ordenCompraId") |
| [referencia](#referencia)       | `string`  | Required | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-referencia.md "undefined#/properties/referencia")       |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-tipo.md "undefined#/properties/tipo")                   |
| [total](#total)                 | `string`  | Required | cannot be null | [ProveedorCompraRow](proveedorcomprarow-properties-total.md "undefined#/properties/total")                 |

## estado

OC lifecycle state when tipo is orden\_compra

`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## estadoPago



`estadoPago`

* is required

* Type: `string` ([ProveedorCompraEstadoPago](proveedorcompraestadopago.md))

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcompraestadopago.md "undefined#/properties/estadoPago")

### estadoPago Type

`string` ([ProveedorCompraEstadoPago](proveedorcompraestadopago.md))

### estadoPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"pendiente"` |             |
| `"parcial"`   |             |
| `"pagada"`    |             |
| `"n_a"`       |             |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## ordenCompraId



`ordenCompraId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-ordencompraid.md "undefined#/properties/ordenCompraId")

### ordenCompraId Type

`integer`

## referencia



`referencia`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"orden_compra"` |             |
| `"comprobante"`  |             |

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCompraRow](proveedorcomprarow-properties-total.md "undefined#/properties/total")

### total Type

`string`
