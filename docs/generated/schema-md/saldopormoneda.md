# SaldoPorMoneda Schema

```txt
undefined
```

Customer running balance for a single currency (#206).

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaldoPorMoneda.schema.json](../schema-json/SaldoPorMoneda.schema.json "open original schema") |

## SaldoPorMoneda Type

`object` ([SaldoPorMoneda](saldopormoneda.md))

# SaldoPorMoneda Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                           |
| :---------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [moneda](#moneda) | `string` | Required | cannot be null | [SaldoPorMoneda](saldopormoneda-properties-moneda.md "undefined#/properties/moneda") |
| [saldo](#saldo)   | `string` | Required | cannot be null | [SaldoPorMoneda](saldopormoneda-properties-saldo.md "undefined#/properties/saldo")   |

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [SaldoPorMoneda](saldopormoneda-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**maximum length**: the maximum number of characters for this string is: `3`

**minimum length**: the minimum number of characters for this string is: `3`

## saldo



`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [SaldoPorMoneda](saldopormoneda-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`
