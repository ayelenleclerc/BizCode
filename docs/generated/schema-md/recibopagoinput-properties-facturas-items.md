# Untitled object in ReciboPagoInput Schema

```txt
undefined#/properties/facturas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboPagoInput.schema.json\*](../schema-json/ReciboPagoInput.schema.json "open original schema") |

## items Type

`object` ([Details](recibopagoinput-properties-facturas-items.md))

# items Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                                                                           |
| :------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [comprobanteCompraId](#comprobantecompraid) | `integer` | Optional | cannot be null | [ReciboPagoInput](recibopagoinput-properties-facturas-items-properties-comprobantecompraid.md "undefined#/properties/facturas/items/properties/comprobanteCompraId") |
| [facturaRef](#facturaref)                   | `string`  | Required | cannot be null | [ReciboPagoInput](recibopagoinput-properties-facturas-items-properties-facturaref.md "undefined#/properties/facturas/items/properties/facturaRef")                   |
| [monto](#monto)                             | `number`  | Required | cannot be null | [ReciboPagoInput](recibopagoinput-properties-facturas-items-properties-monto.md "undefined#/properties/facturas/items/properties/monto")                             |

## comprobanteCompraId



`comprobanteCompraId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-facturas-items-properties-comprobantecompraid.md "undefined#/properties/facturas/items/properties/comprobanteCompraId")

### comprobanteCompraId Type

`integer`

## facturaRef



`facturaRef`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-facturas-items-properties-facturaref.md "undefined#/properties/facturas/items/properties/facturaRef")

### facturaRef Type

`string`

## monto



`monto`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboPagoInput](recibopagoinput-properties-facturas-items-properties-monto.md "undefined#/properties/facturas/items/properties/monto")

### monto Type

`number`

### monto Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`
