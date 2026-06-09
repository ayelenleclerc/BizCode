# ProveedorCompraEstadoPago Schema

```txt
undefined#/properties/estadoPago
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [ProveedorCompraRow.schema.json\*](../schema-json/ProveedorCompraRow.schema.json "open original schema") |

## estadoPago Type

`string` ([ProveedorCompraEstadoPago](proveedorcompraestadopago.md))

## estadoPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"pendiente"` |             |
| `"parcial"`   |             |
| `"pagada"`    |             |
| `"n_a"`       |             |
