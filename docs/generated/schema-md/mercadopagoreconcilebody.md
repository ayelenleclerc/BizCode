# MercadoPagoReconcileBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoReconcileBody.schema.json](../schema-json/MercadoPagoReconcileBody.schema.json "open original schema") |

## MercadoPagoReconcileBody Type

`object` ([MercadoPagoReconcileBody](mercadopagoreconcilebody.md))

# MercadoPagoReconcileBody Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [facturaId](#facturaid)     | `integer` | Required | cannot be null | [MercadoPagoReconcileBody](mercadopagoreconcilebody-properties-facturaid.md "undefined#/properties/facturaId")     |
| [mpPaymentId](#mppaymentid) | `string`  | Required | cannot be null | [MercadoPagoReconcileBody](mercadopagoreconcilebody-properties-mppaymentid.md "undefined#/properties/mpPaymentId") |

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoReconcileBody](mercadopagoreconcilebody-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## mpPaymentId



`mpPaymentId`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconcileBody](mercadopagoreconcilebody-properties-mppaymentid.md "undefined#/properties/mpPaymentId")

### mpPaymentId Type

`string`

### mpPaymentId Constraints

**maximum length**: the maximum number of characters for this string is: `60`

**minimum length**: the minimum number of characters for this string is: `1`
