# ComprobantePendiente Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComprobantePendienteListEnvelope.schema.json\*](../schema-json/ComprobantePendienteListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ComprobantePendiente](comprobantependiente.md))

# items Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [comprobanteCompraId](#comprobantecompraid) | `integer` | Required | cannot be null | [ComprobantePendiente](comprobantependiente-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId") |
| [facturaRef](#facturaref)                   | `string`  | Required | cannot be null | [ComprobantePendiente](comprobantependiente-properties-facturaref.md "undefined#/properties/facturaRef")                   |
| [fecha](#fecha)                             | `string`  | Required | cannot be null | [ComprobantePendiente](comprobantependiente-properties-fecha.md "undefined#/properties/fecha")                             |
| [pagado](#pagado)                           | `string`  | Required | cannot be null | [ComprobantePendiente](comprobantependiente-properties-pagado.md "undefined#/properties/pagado")                           |
| [pendiente](#pendiente)                     | `string`  | Required | cannot be null | [ComprobantePendiente](comprobantependiente-properties-pendiente.md "undefined#/properties/pendiente")                     |
| [total](#total)                             | `string`  | Required | cannot be null | [ComprobantePendiente](comprobantependiente-properties-total.md "undefined#/properties/total")                             |

## comprobanteCompraId



`comprobanteCompraId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobantePendiente](comprobantependiente-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId")

### comprobanteCompraId Type

`integer`

## facturaRef



`facturaRef`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobantePendiente](comprobantependiente-properties-facturaref.md "undefined#/properties/facturaRef")

### facturaRef Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobantePendiente](comprobantependiente-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## pagado



`pagado`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobantePendiente](comprobantependiente-properties-pagado.md "undefined#/properties/pagado")

### pagado Type

`string`

## pendiente



`pendiente`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobantePendiente](comprobantependiente-properties-pendiente.md "undefined#/properties/pendiente")

### pendiente Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobantePendiente](comprobantependiente-properties-total.md "undefined#/properties/total")

### total Type

`string`
