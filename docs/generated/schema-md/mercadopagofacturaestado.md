# MercadoPagoFacturaEstado Schema

```txt
undefined#/properties/estado
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [MercadoPagoFacturaPayment.schema.json\*](../schema-json/MercadoPagoFacturaPayment.schema.json "open original schema") |

## estado Type

`string` ([MercadoPagoFacturaEstado](mercadopagofacturaestado.md))

## estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"none"`      |             |
| `"pending"`   |             |
| `"approved"`  |             |
| `"rejected"`  |             |
| `"cancelled"` |             |
| `"expired"`   |             |
