# CobranzasPorFormaPago Schema

```txt
undefined#/properties/porFormaPago/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReporteCobranzasRow.schema.json\*](../schema-json/ReporteCobranzasRow.schema.json "open original schema") |

## items Type

`object` ([CobranzasPorFormaPago](cobranzasporformapago.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [CobranzasPorFormaPago](cobranzasporformapago-properties-descripcion.md "undefined#/properties/descripcion") |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [CobranzasPorFormaPago](cobranzasporformapago-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [total](#total)             | `string`  | Required | cannot be null | [CobranzasPorFormaPago](cobranzasporformapago-properties-total.md "undefined#/properties/total")             |

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [CobranzasPorFormaPago](cobranzasporformapago-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [CobranzasPorFormaPago](cobranzasporformapago-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [CobranzasPorFormaPago](cobranzasporformapago-properties-total.md "undefined#/properties/total")

### total Type

`string`
