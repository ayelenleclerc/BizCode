# MercadoPagoRefundInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoRefundInput.schema.json](../schema-json/MercadoPagoRefundInput.schema.json "open original schema") |

## MercadoPagoRefundInput Type

`object` ([MercadoPagoRefundInput](mercadopagorefundinput.md))

# MercadoPagoRefundInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                           |
| :---------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [monto](#monto)   | `number` | Optional | cannot be null | [MercadoPagoRefundInput](mercadopagorefundinput-properties-monto.md "undefined#/properties/monto")   |
| [motivo](#motivo) | `string` | Required | cannot be null | [MercadoPagoRefundInput](mercadopagorefundinput-properties-motivo.md "undefined#/properties/motivo") |

## monto

Optional partial amount; defaults to remaining refundable balance.

`monto`

* is optional

* Type: `number`

* cannot be null

* defined in: [MercadoPagoRefundInput](mercadopagorefundinput-properties-monto.md "undefined#/properties/monto")

### monto Type

`number`

### monto Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefundInput](mercadopagorefundinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `500`

**minimum length**: the minimum number of characters for this string is: `10`
