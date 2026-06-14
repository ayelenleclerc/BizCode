# MercadoPagoChargebackPatchInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoChargebackPatchInput.schema.json](../schema-json/MercadoPagoChargebackPatchInput.schema.json "open original schema") |

## MercadoPagoChargebackPatchInput Type

`object` ([MercadoPagoChargebackPatchInput](mercadopagochargebackpatchinput.md))

# MercadoPagoChargebackPatchInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                                             |
| :---------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [estado](#estado) | `string` | Required | cannot be null | [MercadoPagoChargebackPatchInput](mercadopagochargebackpatchinput-properties-estado.md "undefined#/properties/estado") |

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargebackPatchInput](mercadopagochargebackpatchinput-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"resuelto"` |             |
| `"ignorado"` |             |
