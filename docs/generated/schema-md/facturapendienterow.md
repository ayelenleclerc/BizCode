# FacturaPendienteRow Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturasPendientesEnvelope.schema.json\*](../schema-json/FacturasPendientesEnvelope.schema.json "open original schema") |

## items Type

`object` ([FacturaPendienteRow](facturapendienterow.md))

# items Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :-------------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [comprobanteCompraId](#comprobantecompraid)   | `integer` | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId")   |
| [diasHastaVencimiento](#diashastavencimiento) | `integer` | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-diashastavencimiento.md "undefined#/properties/diasHastaVencimiento") |
| [diasVencido](#diasvencido)                   | `integer` | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-diasvencido.md "undefined#/properties/diasVencido")                   |
| [estado](#estado)                             | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienteestado.md "undefined#/properties/estado")                                            |
| [facturaRef](#facturaref)                     | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-facturaref.md "undefined#/properties/facturaRef")                     |
| [fecha](#fecha)                               | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-fecha.md "undefined#/properties/fecha")                               |
| [pagado](#pagado)                             | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-pagado.md "undefined#/properties/pagado")                             |
| [pendiente](#pendiente)                       | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-pendiente.md "undefined#/properties/pendiente")                       |
| [proveedorCodigo](#proveedorcodigo)           | `integer` | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-proveedorcodigo.md "undefined#/properties/proveedorCodigo")           |
| [proveedorId](#proveedorid)                   | `integer` | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-proveedorid.md "undefined#/properties/proveedorId")                   |
| [proveedorRsocial](#proveedorrsocial)         | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-proveedorrsocial.md "undefined#/properties/proveedorRsocial")         |
| [total](#total)                               | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-total.md "undefined#/properties/total")                               |
| [vencimiento](#vencimiento)                   | `string`  | Required | cannot be null | [FacturaPendienteRow](facturapendienterow-properties-vencimiento.md "undefined#/properties/vencimiento")                   |

## comprobanteCompraId



`comprobanteCompraId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId")

### comprobanteCompraId Type

`integer`

## diasHastaVencimiento



`diasHastaVencimiento`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-diashastavencimiento.md "undefined#/properties/diasHastaVencimiento")

### diasHastaVencimiento Type

`integer`

## diasVencido



`diasVencido`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-diasvencido.md "undefined#/properties/diasVencido")

### diasVencido Type

`integer`

## estado



`estado`

* is required

* Type: `string` ([FacturaPendienteEstado](facturapendienteestado.md))

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienteestado.md "undefined#/properties/estado")

### estado Type

`string` ([FacturaPendienteEstado](facturapendienteestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"pendiente"`       |             |
| `"proxima_vencer"`  |             |
| `"vencida_hoy"`     |             |
| `"vencida_critica"` |             |

## facturaRef



`facturaRef`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-facturaref.md "undefined#/properties/facturaRef")

### facturaRef Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## pagado



`pagado`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-pagado.md "undefined#/properties/pagado")

### pagado Type

`string`

## pendiente



`pendiente`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-pendiente.md "undefined#/properties/pendiente")

### pendiente Type

`string`

## proveedorCodigo



`proveedorCodigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-proveedorcodigo.md "undefined#/properties/proveedorCodigo")

### proveedorCodigo Type

`integer`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## proveedorRsocial



`proveedorRsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-proveedorrsocial.md "undefined#/properties/proveedorRsocial")

### proveedorRsocial Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-total.md "undefined#/properties/total")

### total Type

`string`

## vencimiento



`vencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPendienteRow](facturapendienterow-properties-vencimiento.md "undefined#/properties/vencimiento")

### vencimiento Type

`string`

### vencimiento Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
