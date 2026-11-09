# Untitled string in ReciboPago Schema

```txt
undefined#/properties/metodoPago
```

`echeq` is accepted only when the tenant has module `fiscal.cheques` enabled (AR-only). Runtime rejects `echeq` otherwise (#440 / #231).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [ReciboPago.schema.json\*](../schema-json/ReciboPago.schema.json "open original schema") |

## metodoPago Type

`string`

## metodoPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"transferencia"` |             |
| `"cheque"`        |             |
| `"efectivo"`      |             |
| `"echeq"`         |             |
