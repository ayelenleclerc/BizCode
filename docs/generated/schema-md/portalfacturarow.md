# PortalFacturaRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalFacturaRow.schema.json](../schema-json/PortalFacturaRow.schema.json "open original schema") |

## PortalFacturaRow Type

`object` ([PortalFacturaRow](portalfacturarow.md))

# PortalFacturaRow Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [estado](#estado)               | `string`  | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-estado.md "undefined#/properties/estado")               |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-fecha.md "undefined#/properties/fecha")                 |
| [id](#id)                       | `integer` | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-id.md "undefined#/properties/id")                       |
| [mpEstado](#mpestado)           | `string`  | Optional | cannot be null | [PortalFacturaRow](portalfacturarow-properties-mpestado.md "undefined#/properties/mpEstado")           |
| [mpPaymentLink](#mppaymentlink) | `string`  | Optional | cannot be null | [PortalFacturaRow](portalfacturarow-properties-mppaymentlink.md "undefined#/properties/mpPaymentLink") |
| [pagado](#pagado)               | `string`  | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-pagado.md "undefined#/properties/pagado")               |
| [pendiente](#pendiente)         | `string`  | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-pendiente.md "undefined#/properties/pendiente")         |
| [ref](#ref)                     | `string`  | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-ref.md "undefined#/properties/ref")                     |
| [total](#total)                 | `string`  | Required | cannot be null | [PortalFacturaRow](portalfacturarow-properties-total.md "undefined#/properties/total")                 |

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"pagada"`    |             |
| `"pendiente"` |             |
| `"vencida"`   |             |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## mpEstado



`mpEstado`

* is optional

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-mpestado.md "undefined#/properties/mpEstado")

### mpEstado Type

`string`

## mpPaymentLink



`mpPaymentLink`

* is optional

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-mppaymentlink.md "undefined#/properties/mpPaymentLink")

### mpPaymentLink Type

`string`

### mpPaymentLink Constraints

**URI**: the string must be a URI, according to [RFC 3986](https://tools.ietf.org/html/rfc3986 "check the specification")

## pagado



`pagado`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-pagado.md "undefined#/properties/pagado")

### pagado Type

`string`

## pendiente



`pendiente`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-pendiente.md "undefined#/properties/pendiente")

### pendiente Type

`string`

## ref



`ref`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-ref.md "undefined#/properties/ref")

### ref Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalFacturaRow](portalfacturarow-properties-total.md "undefined#/properties/total")

### total Type

`string`
