# MercadoPagoRefund Schema

```txt
undefined#/properties/refunds/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoRefundStatus.schema.json\*](../schema-json/MercadoPagoRefundStatus.schema.json "open original schema") |

## items Type

`object` ([MercadoPagoRefund](mercadopagorefund.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-createdat.md "undefined#/properties/createdAt")         |
| [errorMessage](#errormessage)   | `string`  | Optional | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-errormessage.md "undefined#/properties/errorMessage")   |
| [estado](#estado)               | `string`  | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-estado.md "undefined#/properties/estado")               |
| [facturaId](#facturaid)         | `integer` | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-facturaid.md "undefined#/properties/facturaId")         |
| [id](#id)                       | `integer` | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-id.md "undefined#/properties/id")                       |
| [monto](#monto)                 | `string`  | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-monto.md "undefined#/properties/monto")                 |
| [motivo](#motivo)               | `string`  | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-motivo.md "undefined#/properties/motivo")               |
| [mpPaymentId](#mppaymentid)     | `string`  | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-mppaymentid.md "undefined#/properties/mpPaymentId")     |
| [mpRefundId](#mprefundid)       | `string`  | Optional | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-mprefundid.md "undefined#/properties/mpRefundId")       |
| [notaCreditoId](#notacreditoid) | `integer` | Optional | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-notacreditoid.md "undefined#/properties/notaCreditoId") |
| [reciboCobroId](#recibocobroid) | `integer` | Optional | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-recibocobroid.md "undefined#/properties/reciboCobroId") |
| [updatedAt](#updatedat)         | `string`  | Required | cannot be null | [MercadoPagoRefund](mercadopagorefund-properties-updatedat.md "undefined#/properties/updatedAt")         |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## errorMessage



`errorMessage`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-errormessage.md "undefined#/properties/errorMessage")

### errorMessage Type

`string`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"iniciado"`   |             |
| `"procesando"` |             |
| `"completado"` |             |
| `"fallido"`    |             |

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-id.md "undefined#/properties/id")

### id Type

`integer`

### id Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## monto



`monto`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-monto.md "undefined#/properties/monto")

### monto Type

`string`

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

## mpPaymentId



`mpPaymentId`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-mppaymentid.md "undefined#/properties/mpPaymentId")

### mpPaymentId Type

`string`

## mpRefundId



`mpRefundId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-mprefundid.md "undefined#/properties/mpRefundId")

### mpRefundId Type

`string`

## notaCreditoId



`notaCreditoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-notacreditoid.md "undefined#/properties/notaCreditoId")

### notaCreditoId Type

`integer`

### notaCreditoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## reciboCobroId



`reciboCobroId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-recibocobroid.md "undefined#/properties/reciboCobroId")

### reciboCobroId Type

`integer`

### reciboCobroId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefund](mercadopagorefund-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
